const UserService = require("../services/UserService");
const JwtService = require("../services/JwtService");

const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword, phone } =
      req.body;

    const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;

    const isCheckEmail = reg.test(email);
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return res.status(200).json({
        status: "ERR",
        message: "Vui lòng điền đầy đủ thông tin",
      });
    } else if (!isCheckEmail) {
      return res.status(200).json({
        status: "ERR",
        message: "Email không hợp lệ",
      });
    } else if (password !== confirmPassword) {
      return res.status(200).json({
        status: "ERR",
        message: "Mật khẩu xác nhận không khớp",
      });
    }
    console.log("isCheckEmail", isCheckEmail);
    const response = await UserService.createUser(req.body);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const response = await UserService.changePassword(req.body);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const response = await UserService.forgotPassword(req.body);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const response = await UserService.resetPassword(req.body);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;

    const isCheckEmail = reg.test(email);
    if (!email || !password) {
      return res.status(200).json({
        status: "ERR",
        message: "Vui lòng điền đầy đủ thông tin",
      });
    } else if (!isCheckEmail) {
      return res.status(200).json({
        status: "ERR",
        message: "Email không hợp lệ",
      });
    }
    const response = await UserService.loginUser(req.body);

    const { refresh_token, ...newResponse } = response;
    res.cookie("refresh_token", refresh_token, {
      domain: ".october16th.store",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    return res.status(200).json({ ...newResponse, refresh_token });
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    res.clearCookie("refresh_token");
    return res.status(200).json({
      status: "OK",
      message: "Log out successfully",
    });
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

const updateUser = async (req, res) => {
  console.log(req.body);
  try {
    const userId = req.params.id;
    const data = req.body;

    if (!userId) {
      return res.status(400).json({
        status: "ERROR",
        message: "The userId is required ",
      });
    }
    console.log(userId);
    const response = await UserService.updateUser(userId, data);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const token = req.headers;
    console.log(token);

    if (!userId) {
      return res.status(400).json({
        status: "ERROR",
        message: "The userId is required ",
      });
    }
    console.log(userId);
    const response = await UserService.deleteUser(userId);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

const deleteMany = async (req, res) => {
  try {
    const ids = req.body.ids;

    if (!ids) {
      return res.status(400).json({
        status: "ERROR",
        message: "The ids is required ",
      });
    }
    const response = await UserService.deleteManyUser(ids);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

const viewedProducts = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.params.id;

    const response = await UserService.viewedProducts(productId, userId);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

const getViewedProducts = async (req, res) => {
  try {
    const userId = req.params.id;

    const response = await UserService.getViewedProducts(userId);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

const getAllUser = async (req, res) => {
  try {
    const response = await UserService.getAllUser();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

const getDetailsUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(200).json({
        status: "ERROR",
        message: "The user id is required",
      });
    }
    const response = await UserService.getDetailsUser(userId);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const token = req.headers.refresh_token;
    if (!token) {
      return res.status(200).json({
        status: "ERROR",
        message: "The token is required",
      });
    }

    const response = await JwtService.refreshTokenJwtService(token);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};
module.exports = {
  createUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  changePassword,
  updateUser,
  deleteUser,
  deleteMany,
  getAllUser,
  getDetailsUser,
  refreshToken,
  viewedProducts,
  getViewedProducts,
};
