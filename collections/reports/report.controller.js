const express = require("express");
const router = express.Router();
const reportService = require("./report.service");

//routes
router.post("/create", create);
router.get("/getByVehicle", getByVehicle);
router.get("/getByUser", getByUser);
router.get("/getMyReports", getMyReports);
router.put("/changeStatus", changeStatus);
router.put("/approvePayment/:id", approvePayment);
router.get("/reportMetrics", reportMetrics);

//get APIs
router.get("/", getAll);
router.get("/:id", getById);

module.exports = router;

//create report

function create(req, res, next) {
  reportService
    .create(req.body, req.headers.authorization.split(" ")[1])
    .then((response) =>
      typeof response == "object"
        ? res.status(200).json(response)
        : res.status(400).json({ message: response })
    )
    .catch((err) => next(err));
}

//fetch a vehicle's reports

function getByVehicle(req, res, next) {
  reportService
    .getByVehicle(req.query.page, req.query.limit, req.query.id)
    .then((reports) =>
      reports
        ? res.status(200).json(reports)
        : res
            .status(400)
            .json({ message: "There are no reports with that vehicle ID." })
    )
    .catch((err) => next(err));
}

//fetch reports for all of the user's vehicles

function getByUser(req, res, next) {
  reportService
    .getByUser(
      req.headers.authorization.split(" ")[1],
      req.query.page,
      req.query.limit
    )
    .then((response) =>
      typeof response == "object"
        ? res.status(200).json(response)
        : res.status(400).json({ message: response })
    )
    .catch((err) => next(err));
}

//get my reports

function getMyReports(req, res, next) {
  reportService
    .getMyReports(
      req.headers.authorization.split(" ")[1],
      req.query.page,
      req.query.limit
    )
    .then((response) =>
      typeof response == "object"
        ? res.status(200).json(response)
        : res.status(400).json({ message: response })
    )
    .catch((err) => next(err));
}

//change report status

function changeStatus(req, res, next) {
  reportService
    .changeStatus(req.body.id, req.body.statusCode, req.body.rejectReason)
    .then((report) =>
      report
        ? res.status(200).json(report)
        : res.status(400).json({ message: "Invalid report ID." })
    )
    .catch((err) => next(err));
}

//approve a report's payment

function approvePayment(req, res, next) {
  reportService
    .approvePayment(req.user.sub, req.params.id)
    .then((report) =>
      report
        ? res.status(200).json(report)
        : res.status(400).json({ message: "Invalid report ID." })
    )
    .catch((err) => next(err));
}

//get report metrics

function reportMetrics(req, res, next) {
  reportService
    .reportMetrics(req.user.sub)
    .then((report) =>
      report
        ? res.status(200).json(report)
        : res
            .status(400)
            .json({ message: "The report could not be generated." })
    )
    .catch((err) => next(err));
}

function getAll(req, res, next) {
  reportService
    .getAll()
    .then((reports) => res.json(reports))
    .catch((err) => next(err));
}

function getById(req, res, next) {
  reportService
    .getById(req.params.id)
    .then((report) =>
      report
        ? res.json(report)
        : res.status(404).json({ message: "Invalid ID." })
    )
    .catch((err) => next(err));
}
