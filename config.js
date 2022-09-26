const path = require("path");

let envFile = ".env";
if (process.env.NODE_ENV === "test") {
  envFile = ".env.test";
}

require("dotenv").config({
  path: path.resolve(__dirname, envFile),
});

module.exports = {
  SECRET_KEY: process.env.SECRET_KEY,
  PORT: process.env.PORT,
  DB_URL: process.env.DB_URL,
  DB_NAME: process.env.DB_NAME,
  MONGO_ADMINDB: process.env.MONGO_ADMINDB,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME,
  AWS_BUCKET_REGION: process.env.AWS_BUCKET_REGION,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_PATH: process.env.AWS_PATH,
  ONESIGNAL_APP_ID: process.env.ONESIGNAL_APP_ID,
  ONESIGNAL_API_KEY: process.env.ONESIGNAL_API_KEY,
  ADMIN_ID: process.env.ADMIN_ID,
  GMAIL_ADDRESS: process.env.GMAIL_ADDRESS,
  GMAIL_APP_PW: process.env.GMAIL_APP_PW,
};
