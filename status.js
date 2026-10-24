const { call, reply, wrap } = require('../../lib/otcharts');
// /api/status            -> venues (+ their timeframes) and usage
// /api/status?only=usage -> usage only (OTCharts documents /v1/usage as never counting against the quota)
exports.handler = wrap(async (q) => {
  const usage = await call('/v1/usage');
  if (q.only === 'usage') return reply(200, { usage });
  const venues = await call('/v1/venues', {}, { ttl: 3600 });
  return reply(200, { venues: venues.venues, usage });
});
