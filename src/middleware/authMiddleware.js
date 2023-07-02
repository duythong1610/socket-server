const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/UserModel");
dotenv.config();

const authMiddleWare = (req, res, next) => {
  const token = req.headers.token.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
    if (err) {
      return res.status(404).json({
        message: "The authentication",
        status: "ERROR",
      });
    }

    if (user?.isAdmin) {
      const { id } = user;

      User.findById(id).then((userData) => {
        req.user = userData;
        next();
      });
    } else if (user) {
      const { id } = user;

      User.findById(id).then((userData) => {
        req.user = userData;
        next();
      });
    } else {
      return res.status(404).json({
        message: "The authentication",
        status: "ERROR",
      });
    }
  });
};

const authUserMiddleWare = (req, res, next) => {
  const token = req.headers.token.split(" ")[1];
  const userId = req.params.id;
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
    console.log({ user });
    if (err) {
      return res.status(404).json({
        message: "The authentication",
        status: "ERROR",
      });
    }

    if (user?.isAdmin || user?.id === userId) {
      next();
    } else {
      return res.status(404).json({
        message: "The authentication",
        status: "ERROR",
      });
    }
  });
};

module.exports = { authMiddleWare, authUserMiddleWare };
