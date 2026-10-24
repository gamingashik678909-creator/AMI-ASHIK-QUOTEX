const { call, reply, wrap, venueOf, fail } = require('../../lib/otcharts');
// Raw OHLC from /v1/candles. One upstream request per call; short cache so repeated taps do not burn quota.
exports.handler = wrap(async (q) => {
  const venue = venueOf(q);
  if (!q.symbol) throw fail(400, 'symbol is required');
  const tf = parseInt(q.tf || '60', 10);
  const limit = Math.min(parseInt(q.limit || '300', 10) || 300, venue === 'quotex' ? 500 : 1500);
  const ttl = Math.min(30, Math.max(5, Math.floor(tf / 2)));
  return reply(200, await call('/v1/candles', { venue, symbol: q.symbol, tf, limit }, { ttl }));
});
