const { ADMIN_ID } = require("../../config");
const db = require("../../_helpers/db");
const Report = db.Report;
const Vehicle = db.Vehicle;
const User = db.User;
const userService = require("../users/user.service");
const push = require("../../_helpers/push");
const subWeeks = require("date-fns/subWeeks");

module.exports = {
  create,
  getByVehicle,
  getByUser,
  getMyReports,
  changeStatus,
  approvePayment,
  reportMetrics,
  getAll,
  getById,
};

//Create report

async function create(userParam, token) {
  //checks for invalid report types
  if (!(userParam.type == "Acarreo" || userParam.type == "Robo"))
    return `report type can only be 'Acarreo' or 'Robo', case sensitive.`;

  //finds the vehicle with the owner's data
  const vehicle = await Vehicle.findOne({ _id: userParam.vehicleId }).populate({
    path: "user",
    model: User,
    select: "name lastName currency currencyAmount",
  });

  if (!vehicle) return "Invalid vehicle ID.";

  const userId = await userService.getUserId(token);

  //the vehicle owner cannot report its own vehicle
  if (vehicle.user.id == userId) return "You cannot report your own vehicle.";

  const report = new Report({
    vehicle: userParam.vehicleId,
    type: userParam.type,
    sender: userId,
    receiver: vehicle.user.id,
    description: userParam.description,
    createdAt: Date.now(),
  });

  //location is mandatory, should be recieved via body
  if (!userParam.latitude || !userParam.longitude)
    return "Unable to retrieve coordinates.";

  //location is assigned after report creation
  report.location.coordinates = [userParam.latitude, userParam.longitude];

  const reportId = report._id;

  await report.save();

  //returns the new report populated with relevant data
  const populatedReport = await Report.findById(reportId)
    .populate({
      path: "vehicle",
      model: Vehicle,
    })
    .populate({
      path: "sender",
      model: User,
      select: "name lastName",
    })
    .populate({
      path: "receiver",
      model: User,
      select: "name lastName currency currencyAmount doNotDisturb",
    });

  const receiverDevices = await userService.getUserDevices(
    populatedReport.receiver.id
  );

  if (receiverDevices.length > 0 && !populatedReport.receiver.doNotDisturb)
    await push.send(
      receiverDevices,
      "Tienes un nuevo reporte!",
      populatedReport._id
    );

  return populatedReport;
}

//fetch a vehicle's reports

async function getByVehicle(page, limit, id) {
  //defaults/formats the page and limit parameters
  !page || page <= 1 || isNaN(page)
    ? (page = 0)
    : (page = (Number(page) - 1) * limit);

  !limit || isNaN(limit) ? (limit = 10) : (limit = Number(limit));

  const reports = await Report.find({ vehicle: id })
    .populate({
      path: "vehicle",
      model: Vehicle,
    })
    .populate({
      path: "sender",
      model: User,
      select: "name lastName",
    })
    .populate({
      path: "receiver",
      model: User,
      select: "name lastName currency currencyAmount",
    })
    .sort({ "reportStatus.code": 1, createdAt: -1 })
    .skip(page)
    .limit(limit);

  if (!reports || reports.length == 0) return;

  return reports;
}

//fetch reports for all of the user's vehicles

async function getByUser(token, page, limit) {
  //defaults/formats the page and limit parameters
  !page || page <= 1 || isNaN(page)
    ? (page = 0)
    : (page = (Number(page) - 1) * limit);

  !limit || isNaN(limit) ? (limit = 5) : (limit = Number(limit));
  const userId = await userService.getUserId(token);

  //retrieves the user in order to get its vehicle list.
  const user = await User.findById(userId);

  if (user.vehicleList.length == 0)
    return "The user has no vehicles registered.";

  const reports = await Report.find({
    vehicle: { $in: user.vehicleList },
  })
    .populate({
      path: "vehicle",
      model: Vehicle,
    })
    .populate({
      path: "sender",
      model: User,
      select: "name lastName",
    })
    .populate({
      path: "receiver",
      model: User,
      select: "name lastName currency currencyAmount",
    })
    .sort({ "reportStatus.code": 1, createdAt: -1 })
    .skip(page)
    .limit(limit);

  if (!reports || reports.length == 0)
    return `There are no reports to any of the user's vehicles.`;

  return reports;
}

//fetch alerts the user made

async function getMyReports(token, page, limit) {
  //defaults/formats the page and limit parameters
  !page || page <= 1 || isNaN(page)
    ? (page = 0)
    : (page = (Number(page) - 1) * limit);

  !limit || isNaN(limit) ? (limit = 10) : (limit = Number(limit));

  const userId = await userService.getUserId(token);

  const reports = await Report.find({ sender: userId })
    .populate({
      path: "vehicle",
      model: Vehicle,
    })
    .populate({
      path: "sender",
      model: User,
      select: "name lastName",
    })
    .populate({
      path: "receiver",
      model: User,
      select: "name lastName currency currencyAmount",
    })
    .sort({ "reportStatus.code": 1, createdAt: -1 })
    .skip(page)
    .limit(limit);

  if (!reports || reports.length == 0) return "You have no reports yet.";

  return reports;
}

//change status options: 0 = Pendiente, 1 = En Espera, 2 = Rechazado, 3 = Pago, 4 = Cancelado, 5 = Expirado

async function changeStatus(id, statusCode, rejectReason) {
  if (statusCode < 0 || statusCode > 5 || isNaN(statusCode))
    return "invalid status code. 0 = Pendiente, 1 = En Espera, 2 = Rechazado, 3 = Pago, 4 = Cancelado, 5 = Expirado";

  let status;

  //creates the status label according to the parameter received

  switch (Number(statusCode)) {
    case 0:
      status = "Pendiente";
      break;
    case 1:
      status = "En Espera";
      break;
    case 2:
      status = "Rechazado";
      break;
    case 3:
      status = "Pago";
      break;
    case 4:
      status = "Cancelado";
      break;
    case 5:
      status = "Expirado";
      break;
  }

  const report = await Report.findById(id)
    .populate({
      path: "vehicle",
      model: Vehicle,
    })
    .populate({
      path: "sender",
      model: User,
      select: "name lastName",
    })
    .populate({
      path: "receiver",
      model: User,
      select: "name lastName currency currencyAmount doNotDisturb",
    });

  //updates the report status

  if (!report) return;

  report.reportStatus.label = status;
  report.reportStatus.code = statusCode;

  //rejection of a report must have a reason. frontend should send it via body
  if (statusCode == 2 && rejectReason) {
    report.rejectReason = rejectReason;

    const senderDevices = await userService.getUserDevices(report.sender.id);

    if (senderDevices.length > 0 && !report.receiver.doNotDisturb)
      await push.send(
        senderDevices,
        "Un reporte que enviaste fue rechazado.",
        report._id
      );
  } else if (statusCode == 2 && !rejectReason)
    throw "Please, provide a reason for the rejection.";

  await report.save();

  return report;
}

async function approvePayment(userId, id) {
  /* both users must approve payment for the report
  to be considered paid. the receiver approves when they send the payment, the report goes on hold.
  then, the sender confirms payment reception and the report changes to paid. */
  const report = await Report.findById(id)
    .populate({
      path: "vehicle",
      model: Vehicle,
    })
    .populate({
      path: "sender",
      model: User,
      select: "name lastName",
    })
    .populate({
      path: "receiver",
      model: User,
      select: "name lastName currency currencyAmount doNotDisturb",
    });

  if (report.sender.id != userId && report.receiver.id != userId)
    throw "You are not the receiver nor the sender of this report.";

  if (report.approvals.includes(userId))
    throw `You have already approved this report's payment.`;

  report.approvals.push(userId);

  if (report.approvals.length == 2) {
    //when both users approved
    report.reportStatus = {
      code: 3,
      label: "Pago",
    };
  } else if (report.approvals.length == 1) {
    //when only the receiver approved
    report.reportStatus = {
      code: 1,
      label: "En Espera",
    };

    //sends a notification

    let notifiedUser;

    report.sender.id == userId
      ? (notifiedUser = report.receiver.id)
      : (notifiedUser = report.sender.id);

    const notifiedUserDevices = await userService.getUserDevices(notifiedUser);

    if (notifiedUserDevices.length > 0 && !report.receiver.doNotDisturb)
      await push.send(
        notifiedUserDevices,
        "Aprobaron el pago de uno de tus reportes!",
        report._id
      );
  }

  await report.save();

  return report;
}

async function getAll() {
  return await Report.find()
    .populate({
      path: "vehicle",
      model: Vehicle,
    })
    .populate({
      path: "sender",
      model: User,
      select: "name lastName",
    })
    .populate({
      path: "receiver",
      model: User,
      select: "name lastName currency currencyAmount",
    });
}

//needs report id via params
async function getById(id) {
  return await Report.findById(id)
    .populate({
      path: "vehicle",
      model: Vehicle,
    })
    .populate({
      path: "sender",
      model: User,
      select: "name lastName",
    })
    .populate({
      path: "receiver",
      model: User,
      select: "name lastName currency currencyAmount",
    });
}

async function reportMetrics(userId) {
  //metrics for the admin panel.
  if (userId != ADMIN_ID) throw "You do not have admin privileges.";

  const reports = await Report.find();

  let weeklyGenerated = 0,
    weeklyPaid = 0,
    weeklyRejected = 0,
    weeklyCancelled = 0,
    totalPending = 0,
    totalWaitingForPayment = 0,
    totalPaid = 0;

  reports.forEach((report) => {
    if (report.createdAt > subWeeks(Date.now(), 1)) {
      weeklyGenerated++;

      if (report.reportStatus.code == 1) weeklyRejected++;
      else if (report.reportStatus.code == 3) weeklyPaid++;
      else if (report.reportStatus.code == 4) weeklyCancelled++;
    }

    if (report.reportStatus.code == 0) totalPending++;
    else if (report.reportStatus.code == 2) totalWaitingForPayment++;
    else if (report.reportStatus.code == 3) totalPaid++;
  });

  return {
    weeklyGenerated,
    weeklyPaid,
    weeklyRejected,
    weeklyCancelled,
    totalPending,
    totalWaitingForPayment,
    totalPaid,
  };
}
