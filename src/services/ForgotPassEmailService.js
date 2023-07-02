const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
var inlineBase64 = require("nodemailer-plugin-inline-base64");
dotenv.config();

const sendEmailForgotPassword = async (email, token) => {
  const encodedEmail = encodeURIComponent(email);
  console.log(encodedEmail);
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.MAIL_ACCOUNT, // generated ethereal user
      pass: process.env.MAIL_PASSWORD, // generated ethereal password
    },
  });
  transporter.use("compile", inlineBase64({ cidPrefix: "somePrefix_" }));

  console.log(process.env.MAIL_PASSWORD, { email });
  console.log({ nodemailer });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: process.env.MAIL_ACCOUNT, // sender address
    to: email, // list of receivers
    subject: "Thiết lập lại mật khẩu đăng nhập October16th Store", // Subject line
    text: "Yêu cầu khôi phục mật khẩu", // plain text body
    html: `
    <div>
Xin chào <b>${email}</b>, chúng tôi nhận được yêu cầu thiết lập lại mật khẩu tại October16th Store, mã khôi phục của bạn là: <b>${token}</b>, mã có hiệu lực trong vòng 15 phút, tuyệt đối không chia sẻ mã này với bất kỳ ai dưới mọi hình thức. Nhấn <a href="https://www.october16th.store/reset-password/?email=${encodedEmail}" style="color: #9333EA;text-decoration: none;">tại đây</a> để thiết lập mật khẩu mới cho tài khoản của bạn
    </div>
    `,
  });
};

module.exports = {
  sendEmailForgotPassword,
};
