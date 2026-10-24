const { call, reply, wrap, venueOf, fail } = require('../../lib/otcharts');
const { analyze } = require('../../lib/engine');
// Fetches candles once, then runs indicators + 3-candle scoring + chronological backtest on CLOSED candles only.
exports.handler = wrap(async (q) => {
  const venue = venueOf(q);
  if (!q.symbol) throw fail(400, 'symbol is required');
  const tf = parseInt(q.tf || '60', 10);
  const limit = Math.min(parseInt(q.limit || '500', 10) || 500, venue === 'quotex' ? 500 : 1500);
  const ttl = Math.min(30, Math.max(5, Math.floor(tf / 2)));
  const d = await call('/v1/candles', { venue, symbol: q.symbol, tf, limit }, { ttl });
  const offset = venue === 'otc' ? 7200 : 0; // Pocket Option stamps bars UTC+2; every other book is UTC
  const now = Math.floor(Date.now() / 1000);
  const payout = q.payout ? Number(q.payout) : null;
  const analysis = analyze(d.candles || [], tf, now, offset, payout);
  return reply(200, {
    meta: { venue, symbol: q.symbol, tf, fetchedAt: now, cached: !!d._cached, count: d.count, gaps: d.gaps || null, open: d.open ?? null, clockOffset: offset },
    candles: (d.candles || []).slice(-120).map((c) => ({ ...c, time: c.time - offset })),
    analysis
  });
});
