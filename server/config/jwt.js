const JWT_SECRET =
  process.env.JWT_SECRET ||
  "Behlah@00001000010000";
const REFRESH_SECRET =
  process.env.REFRESH_SECRET ||
  "Murtaza@222020020002";

module.exports = { JWT_SECRET, REFRESH_SECRET };