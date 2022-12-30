module.exports = (fn) => (req, res, next) => {
  fn(req, res, next).catch((err) => {
    console.log(err);
    return next(err);
  });
};
