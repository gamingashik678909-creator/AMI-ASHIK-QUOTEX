const { call, reply, wrap, venueOf } = require('../../lib/otcharts');
// Live catalogue from /v1/symbols (never hardcoded). Costs 1 request; cached 10 min server-side.
exports.handler = wrap(async (q) => {
  const venue = venueOf(q);
  const d = await call('/v1/symbols', { venue }, { ttl: 600 });
  return reply(200, { venue, count: d.count ?? (d.symbols || []).length, symbols: d.symbols || [] });
});
