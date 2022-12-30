const mongoose = require("mongoose");

const disasterSchema = new mongoose.Schema({
  flame: {
    type: Boolean,
    default: false,
  },
  gas: {
    type: Boolean,
    default: false,
  },
  flood: {
    type: Boolean,
    default: false,
  },
  earthquake: {
    type: Boolean,
    default: false,
  },
  drowning: {
    type: Boolean,
    default: false,
  },
  // or taking distance and do calculations
  distance: { type: Number },
  accident: {
    type: Boolean,
    default: false,
  },
  name: {},

  lat: {
    type: Number,
    required: [true, "Kidly enter latitude"],
  },
  lng: {
    type: Number,
    required: [true, "Kidly enter longitude"],
  },

  rescueUnit: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    // default: Date.now(),
    // select: false,
  },
  time: {},
  date: {},
  isDone: {
    type: Boolean,
    default: false,
  },
  rescueUnitsRefuse: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
});

disasterSchema.pre("save", function (next) {
  // const disasterName = `${this.accident && "Accident"} ${
  //   this.flame && "Fire"
  // } ${this.flood && "Flood"} ${this.earthquake && "Earthquake"} ${
  //   this.drowning && "Drowning"
  // } ${this.gas && "Petroleum Leakage"}`;

  const disasterName = [
    this.accident && "Accident",
    this.flame && "Fire",
    this.flood && "Flood,",
    this.earthquake && "Earthquake",
    this.drowning && "Drowning",
    this.gas && "Petroleum Leakage",
  ].filter((item) => item !== false);

  this.name = disasterName && disasterName.join(" - ");

  // [this.accident, this.flame, this.flood, this.earthquake, this.drowning, this.gas]

  this.createdAt = Date.now();

  const toConverTime = (time) => {
    let hours = time.split(":")[0] * 1;
    if (hours > 12) {
      time = time.split(":").splice(1).join(":");
      hours = hours - 12;
      // console.log(hours);
      return `${hours < 10 ? "0" + hours : hours}:${time} PM`;
      // return `${hours}:${time} PM`;
    } else {
      return `${time} AM`;
    }
  };

  this.time = toConverTime(
    new Date(this.createdAt).toTimeString().split(" ")[0]
  );

  this.date = new Date(this.createdAt)
    .toUTCString()
    .split(" ")
    .splice(0, 4)
    .join(" ");

  if (this.distance * 1 < 5) {
    this.accident = true;
  }

  // console.log(this);
  next();
});

const Disaster = mongoose.model("Disaster", disasterSchema);

module.exports = Disaster;
