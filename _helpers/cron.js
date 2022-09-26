const cron = require("node-cron");
const db = require("./db");
const Report = db.Report;
const BusinessConstants = db.BusinessConstants;
const PlayerId = db.PlayerId;
const sub = require("date-fns/sub");

module.exports = { expiredReports, expiredPlayerIds };

async function expiredReports() {
  /*automatically scans for expired reports and
  changes their status to expired. Happens at 5 AM GMT-3 */
  cron.schedule("15 13 * * *", async () => {
    const expiration = await BusinessConstants.findOne({
      name: "reportExpiration",
    });

    let expirationValue;

    if (expiration)
      expirationValue = sub(Date.now(), { hours: expiration.value });
    else expirationValue = sub(Date.now(), { hours: 24 });

    const reports = await Report.updateMany(
      {
        createdAt: { $lte: expirationValue },
        "reportStatus.code": { $in: [0, 1] },
      },
      { "reportStatus.code": 5, "reportStatus.label": "Expirado" }
    );

    console.info("expired reports cronjob result: ", reports);
  });
}

async function expiredPlayerIds() {
  /* automatically scans for expired sessions and
  removes the device IDs. Happens at 5:30 AM GMT-3 */
  cron.schedule("16 13 * * *", async () => {
    const playerIds = await PlayerId.deleteMany({
      expirationDate: { $lte: Date.now() },
    });

    console.info("expired player ids cronjob result: ", playerIds);
  });
}
