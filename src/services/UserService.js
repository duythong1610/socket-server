const User = require("../models/UserModel");
const bcrypt = require("bcrypt");
const { generalAccessToken, generalRefreshToken } = require("./JwtService");
const { sendEmailForgotPassword } = require("./ForgotPassEmailService");
const e = require("express");
const createUser = (newUser) => {
  return new Promise(async (resolve, reject) => {
    const { firstName, lastName, email, password, confirmPassword, phone } =
      newUser;
    try {
      const checkUser = await User.findOne({
        email: email,
      });
      if (checkUser !== null) {
        resolve({
          status: "ERR",
          message: "Email người dùng đã tồn tại",
        });
      }

      const checkPassword = () => {
        return (
          /\d/.test(password) &&
          /[!@#$%]/.test(password) &&
          /[A-Z]/.test(password) &&
          /[a-z]/.test(password)
        );
      };

      if (!checkPassword() && password.length <= 8) {
        resolve({
          status: "ERR",
          message:
            "Mật khẩu bao gồm ký tự số, chữ cái, chữ cái viết hoa và ký tự đặc biệt",
        });
      }
      if (password.length < 8) {
        resolve({
          status: "ERR",
          message: "Mật khẩu ít nhất 8 ký tự",
        });
      }
      if (checkPassword() && password.length >= 8) {
        const hash = bcrypt.hashSync(password, 10);
        const createUser = await User.create({
          firstName,
          lastName,
          email,
          password: hash,
        });

        if (createUser) {
          resolve({
            status: "OK",
            message: "SUCCESS",
            data: createUser,
          });
        }
      }
    } catch (error) {
      reject(error);
    }
  });
};

const changePassword = (userInfo) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { currentPassword, newPassword, confirmNewPassword, userId } =
        userInfo;
      const user = await User.findById(userId);

      const comparePassword = bcrypt.compareSync(
        currentPassword,
        user.password
      );

      const checkPassword = () => {
        return (
          /\d/.test(newPassword) &&
          /[!@#$%]/.test(newPassword) &&
          /[A-Z]/.test(newPassword) &&
          /[a-z]/.test(newPassword)
        );
      };

      if (!checkPassword() && newPassword.length <= 8) {
        resolve({
          status: "ERR",
          message:
            "Mật khẩu bao gồm ký tự số, chữ cái, chữ cái viết hoa và ký tự đặc biệt",
        });
      }
      if (!comparePassword) {
        resolve({
          status: "ERROR",
          message: "Bạn đã nhập sai mật khẩu hiện tại.",
        });
      }
      if (newPassword !== confirmNewPassword) {
        resolve({
          status: "ERROR",
          message: "Mật khẩu không trùng khớp.",
        });
      }
      if (currentPassword === newPassword) {
        resolve({
          status: "ERROR",
          message: "Mật khẩu mới không được trùng với mật khẩu cũ.",
        });
      } else {
        const hash = bcrypt.hashSync(newPassword, 10);
        user.password = hash;
        await user.save();
        resolve({
          status: "SUCCESS",
          message: "Đổi mật khẩu thành công",
          data: user,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const forgotPassword = (userInfo) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { email } = userInfo;
      const user = await User.findOne({ email });
      const generateForgotPasswordToken = () => {
        const tokenLength = 16;
        const characters =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let token = "";

        for (let i = 0; i < tokenLength; i++) {
          const randomIndex = Math.floor(Math.random() * characters.length);
          token += characters[randomIndex];
        }

        return token;
      };
      const tokenForgotPassword = generateForgotPasswordToken();
      const tokenExpiryMinutes = 15;
      const expiryTime = new Date();
      if (!user) {
        resolve({
          status: "ERROR",
          message: `Không tìm thấy email, vui lòng kiểm tra lại.`,
        });
        return;
      } else if (user && user.forgotPasswordInfo.token) {
        const { expiry } = user.forgotPasswordInfo;
        if (expiry.getTime() < Date.now()) {
          await User.updateOne(
            { email },
            { $unset: { forgotPasswordInfo: 1 } }
          );

          expiryTime.setMinutes(expiryTime.getMinutes() + tokenExpiryMinutes);
          await User.updateOne(
            { email },
            {
              $set: {
                forgotPasswordInfo: {
                  token: tokenForgotPassword,
                  expiry: expiryTime,
                },
              },
            }
          );
          await sendEmailForgotPassword(email, tokenForgotPassword);

          resolve({
            status: "SUCCESS",
            message: `Yêu cầu đã được gửi đến email ${email}, vui lòng kiểm tra hộp thư.`,
          });
          return false;
        } else {
          expiryTime.setMinutes(expiryTime.getMinutes() + tokenExpiryMinutes);
          await User.updateOne(
            { email },
            {
              $set: {
                forgotPasswordInfo: {
                  token: tokenForgotPassword,
                  expiry: expiryTime,
                },
              },
            }
          );
          await sendEmailForgotPassword(email, tokenForgotPassword);
          resolve({
            status: "SUCCESS",
            message: `Yêu cầu đã được gửi đến email ${email}, vui lòng kiểm tra hộp thư.`,
          });
          return;
        }
      } else {
        expiryTime.setMinutes(expiryTime.getMinutes() + tokenExpiryMinutes);
        await User.updateOne(
          { email },
          {
            $set: {
              forgotPasswordInfo: {
                token: tokenForgotPassword,
                expiry: expiryTime,
              },
            },
          }
        );
        await sendEmailForgotPassword(email, tokenForgotPassword);
        resolve({
          status: "SUCCESS",
          message: `Yêu cầu đã được gửi đến email ${email}, vui lòng kiểm tra hộp thư.`,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const resetPassword = (userInfo) => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        email,
        newPassword,
        confirmNewPassword,
        tokenForgotPassword,
        currentTime,
      } = userInfo;
      console.log(userInfo);

      const checkPassword = () => {
        return (
          /\d/.test(newPassword) &&
          /[!@#$%]/.test(newPassword) &&
          /[A-Z]/.test(newPassword) &&
          /[a-z]/.test(newPassword)
        );
      };

      if (!checkPassword() && newPassword.length <= 8) {
        resolve({
          status: "ERROR",
          message:
            "Mật khẩu bao gồm ký tự số, chữ cái, chữ cái viết hoa và ký tự đặc biệt",
        });
        return;
      }

      const user = await User.findOne({
        "forgotPasswordInfo.token": tokenForgotPassword,
        email,
      });
      console.log(user);

      if (!user) {
        resolve({
          status: "ERROR",
          message: `Mã khôi phục không đúng, vui lòng kiểm tra lại`,
        });
        return;
      } else if (user && user.forgotPasswordInfo.token) {
        const convertCurrentTime = new Date(currentTime);
        const { expiry } = user.forgotPasswordInfo;
        if (convertCurrentTime > expiry) {
          resolve({
            status: "ERROR",
            message: `Mã khôi phục đã hết hạn, vui lòng thực hiện yêu cầu khác.`,
          });
          return;
        }

        if (newPassword !== confirmNewPassword) {
          resolve({
            status: "ERROR",
            message: `Mật khẩu không khớp`,
          });
          return;
        }
        const hash = bcrypt.hashSync(newPassword, 10);
        user.password = hash;
        user.forgotPasswordInfo = null;
        await user.save();
        resolve({
          status: "SUCCESS",
          message: `Đặt lại mật khẩu mới thành công.`,
          data: user,
        });
      } else {
        if (newPassword !== confirmNewPassword) {
          resolve({
            status: "ERROR",
            message: `Mật khẩu không khớp`,
          });
          return;
        }
        const hash = bcrypt.hashSync(newPassword, 10);
        user.password = hash;
        user.forgotPasswordInfo = undefined;
        await user.save();
        resolve({
          status: "SUCCESS",
          message: `Đặt lại mật khẩu mới thành công.`,
          data: user,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const loginUser = (userLogin) => {
  return new Promise(async (resolve, reject) => {
    const { email, password } = userLogin;
    try {
      const checkUser = await User.findOne({
        email: email,
      });

      console.log({ checkUser });
      if (checkUser === null) {
        resolve({
          status: "ERR",
          message: "Email đăng nhập không tồn tại",
        });
      }

      const comparePassword = bcrypt.compareSync(password, checkUser.password);
      console.log({ comparePassword });

      if (!comparePassword) {
        resolve({
          status: "ERR",
          message: "Email người dùng hoặc mật khẩu không chính xác",
        });
      }

      const access_token = await generalAccessToken({
        id: checkUser.id,
        isAdmin: checkUser.isAdmin,
      });

      const refresh_token = await generalRefreshToken({
        id: checkUser.id,
        isAdmin: checkUser.isAdmin,
      });
      console.log({ access_token });

      // if (createUser) {
      resolve({
        status: "OK",
        message: "SUCCESS",
        access_token,
        refresh_token,
      });
      // }
    } catch (error) {
      reject(error);
    }
  });
};

const updateUser = (id, data) => {
  console.log({ data });
  return new Promise(async (resolve, reject) => {
    try {
      const checkUser = await User.findOne({ _id: id });
      if (checkUser === null) {
        resolve({
          status: "OK",
          message: "Người dùng không tồn tại",
        });
      }

      console.log("alo", data.isAdmin);

      if (!checkUser.isAdmin && data.isAdmin) {
        // Kiểm tra nếu yêu cầu cập nhật trường `isAdmin`

        resolve({
          status: "OK",
          message: "Bạn không có quyền",
        });
      } else {
        const updateUser = await User.findByIdAndUpdate(id, data, {
          new: true,
        });
        resolve({
          status: "OK",
          message: "SUCCESS",
          data: updateUser,
        });
      }

      // }
    } catch (error) {
      reject(error);
    }
  });
};

const deleteUser = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkUser = await User.findOne({ _id: id });

      if (checkUser === null) {
        resolve({
          status: "OK",
          message: "The user is not defined",
        });
      }
      await User.findByIdAndDelete(id);
      console.log({ updateUser });

      resolve({
        status: "OK",
        message: "Delete user success",
      });
      // }
    } catch (error) {
      reject(error);
    }
  });
};

const deleteManyUser = (ids) => {
  return new Promise(async (resolve, reject) => {
    try {
      await User.deleteMany({
        _id: ids,
      });
      console.log({ updateUser });

      resolve({
        status: "OK",
        message: "Xóa người dùng thành công",
      });
      // }
    } catch (error) {
      reject(error);
    }
  });
};

const viewedProducts = (id, userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log({ id }, { userId });
      await User.findOneAndUpdate(
        { _id: userId },
        { $addToSet: { viewedProducts: id } },
        { new: true, upsert: true }
      );

      resolve({
        status: "OK",
        message: "Success",
      });
      // }
    } catch (error) {
      reject(error);
    }
  });
};

const getViewedProducts = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findOne({ _id: id }, "viewedProducts").populate(
        "viewedProducts",
        ""
      );
      resolve({
        status: "OK",
        message: "Success",
        data: user,
      });
      // }
    } catch (error) {
      reject(error);
    }
  });
};

const getAllUser = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const allUser = await User.find();

      resolve({
        status: "OK",
        data: allUser,
      });
      // }
    } catch (error) {
      reject(error);
    }
  });
};

const getDetailsUser = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findOne(
        {
          _id: id,
        },
        { forgotPasswordInfo: 0, password: 0 }
      );

      console.log(user);
      if (user === null) {
        resolve({
          status: "OK",
          message: "Người dùng không tồn tại",
        });
      }

      resolve({
        status: "OK",
        data: user,
      });
      // }
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  createUser,
  loginUser,
  changePassword,
  forgotPassword,
  resetPassword,
  updateUser,
  deleteUser,
  deleteManyUser,
  getAllUser,
  getDetailsUser,
  viewedProducts,
  getViewedProducts,
};
