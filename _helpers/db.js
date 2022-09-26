const { DB_URL, DB_NAME } = require("../config");
const mongoose = require("mongoose"),
  connectionString = DB_URL,
  connectionOptions = {
    dbName: DB_NAME,
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  };

mongoose.connect(
  connectionString || "mongodb://localhost/gruout",
  connectionOptions
);

mongoose.Promise = global.Promise;

module.exports = {
  connection: mongoose.connection,
  User: require("../collections/users/user.model"),
  Report: require("../collections/reports/report.model"),
  Vehicle: require("../collections/vehicles/vehicle.model"),
  PlayerId: require("../collections/playerIds/playerid.model"),
  BusinessConstants: require("../collections/businessConstants/businessConstants.model"),
  Faq: require("../collections/faqs/faq.model"),
};

/*db connect parameters. nothing crazy, just basic connection parameters to avoid any deprecated errors, connects to local DB.
 for an external server, indicate proper URI*/
