const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController");
const {
  authMiddleWare,
  authUserMiddleWare,
} = require("../middleware/authMiddleware");

router.post("/sign-up", userController.createUser);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);
router.post("/change-password", userController.changePassword);
router.post("/sign-in", userController.loginUser);
router.post("/log-out", userController.logoutUser);
router.put("/update-user/:id", authUserMiddleWare, userController.updateUser);
router.delete(
  "/delete-user/:id",
  authUserMiddleWare,
  userController.deleteUser
);
router.post("/delete-many", authUserMiddleWare, userController.deleteMany);
router.post(
  "/viewed-products/:id",
  authMiddleWare,
  userController.viewedProducts
);

router.get(
  "/get-viewed-products/:id",
  authMiddleWare,
  userController.getViewedProducts
);
router.get("/get-all", authUserMiddleWare, userController.getAllUser);
router.get(
  "/get-details/:id",
  authUserMiddleWare,
  userController.getDetailsUser
);

router.post("/refresh-token", userController.refreshToken);

module.exports = router;
