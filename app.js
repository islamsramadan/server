const path = require("path");
const express = require("express");
const morgan = require("morgan");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const cors = require("cors");

const app = express();
app.use(cors());

// Serving static files
app.use("/public", express.static(path.join(__dirname, "public")));

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("env"));
}

const userRouter = require("./routes/userRouter");
const disasterRouter = require("./routes/disasterRouter");

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));

app.use("/api/users", userRouter);
app.use("/api/disasters", disasterRouter);

// 2) NOT FOUND MIDDLEWARE
app.use((req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

// 3) ERROR MIDDLEWARE
app.use(globalErrorHandler);

module.exports = app;
