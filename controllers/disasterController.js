const Disaster = require("../models/disasterModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // kilo metres
  const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c; // in kilo metres

  return d;
};

exports.getAllDisasters = catchAsync(async (req, res, next) => {
  const disasters = await Disaster.find().populate("rescueUnit");

  res.status(200).json({
    status: "success",
    results: disasters.length,
    data: {
      data: disasters,
    },
  });
});

exports.getDisaster = catchAsync(async (req, res, next) => {
  const disaster = await Disaster.findById(req.params.id);

  if (!disaster) {
    return next(new AppError("Could not find this disaster", 400));
  }

  res.status(200).json({
    status: "success",
    disaster,
    message: "fgggggggggg",
  });
});

exports.getRescueDisasters = catchAsync(async (req, res, next) => {
  const rescue = req.params.rescueId;
  const disasters = await Disaster.find({ rescueUnit: rescue, isDone: false });

  res.status(200).json({
    status: "success",
    results: disasters.length,
    data: {
      disasters,
    },
  });
});

exports.createDisaster = catchAsync(async (req, res, next) => {
  let distance = 100000000000000;

  req.admins.forEach((rescue) => {
    let d = getDistance(req.body.lat, req.body.lng, rescue.lat, rescue.lng);
    if (d < distance) {
      distance = d * 1;
      req.body.rescueUnit = rescue.id;
    }
    // console.log("distance -------------->", d);
    // console.log("Body coords ---------->", req.body.lat, req.body.lng);
    // console.log("rescue id ------------>", rescue.id);
  });

  const disaster = await Disaster.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      disaster,
    },
  });
});

exports.acceptDisaster = catchAsync(async (req, res, next) => {
  const acceptedDisaster = await Disaster.findByIdAndUpdate(
    req.params.disasterId,
    {
      isDone: true,
    }
  );

  if (!acceptedDisaster) {
    return next(new AppError("Could not find this disaster", 400));
  }

  res.status(200).json({
    status: "success",
    acceptedDisaster,
  });
});

exports.refuseDisaster = catchAsync(async (req, res, next) => {
  let distance = 100000000000000;

  const disaster = await Disaster.findById(req.params.disasterId);

  disaster.rescueUnitsRefuse.push(req.params.rescueId);

  disaster.rescueUnitsRefuse.forEach((rescue) =>
    req.admins.filter((admin) => admin._id != rescue)
  );

  disaster.rescueUnit = null;
  req.admins.forEach((rescue) => {
    let d = getDistance(disaster.lat, disaster.lng, rescue.lat, rescue.lng);
    if (d < distance && !disaster.rescueUnitsRefuse.includes(rescue.id)) {
      distance = d * 1;
      disaster.rescueUnit = rescue.id;
    }
    console.log("distance -------------->", d);
    console.log("Body coords ---------->", disaster.lat, disaster.lng);
    console.log("rescue id ------------>", rescue.id);
  });

  const updatedDisaster = await Disaster.findByIdAndUpdate(
    req.params.disasterId,
    {
      rescueUnit: disaster.rescueUnit,
      rescueUnitsRefuse: disaster.rescueUnitsRefuse,
    }
  );

  res.status(201).json({
    status: "success",
    data: {
      updatedDisaster,
    },
  });
});
