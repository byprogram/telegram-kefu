require('dotenv').config();

module.exports = {
  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN,
    botUsername:process.env.TELEGRAM_BOT_USERNAME,
    adminGroupId:process.env.TELEGRAM_ADMIN_GROUPID,
  },
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
};
