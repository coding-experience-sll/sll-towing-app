const { PORT } = require("./config");
require("rootpath")();
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("_helpers/jwt");
const errorHandler = require("_helpers/error-handler");
const cronJob = require("./_helpers/cron");

//Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// use JWT auth to secure the api
app.use(jwt());

// api routes
app.use("/api/users", require("./collections/users/user.controller"));
app.use("/api/reports", require("./collections/reports/report.controller"));
app.use("/api/vehicles", require("./collections/vehicles/vehicle.controller"));
app.use(
  "/api/playerIds",
  require("./collections/playerIds/playerid.controller")
);
app.use(
  "/api/businessConstants",
  require("./collections/businessConstants/businessConstants.controller")
);
app.use("/api/faqs", require("./collections/faqs/faq.controller"));

// global error handler
app.use(errorHandler);

// start server
const port = PORT || 3000;
const server = app.listen(port, function () {
  console.info("Server running on port " + port);
});

//cron jobs
cronJob.expiredReports();
cronJob.expiredPlayerIds();
