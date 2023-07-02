const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
var inlineBase64 = require("nodemailer-plugin-inline-base64");
dotenv.config();

const sendEmailCreateOrder = async (email, orderItems) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.MAIL_ACCOUNT, // generated ethereal user
      pass: process.env.MAIL_PASSWORD, // generated ethereal password
    },
  });
  

  console.log(process.env.MAIL_PASSWORD, { email });
  console.log({ nodemailer });

  let product = "";
  let amount = "";
  orderItems.forEach((order) => {
    product += `<div style="justify-content: space-between;display:flex;align-items:center;margin-bottom: 20px;">
    <img src="${order.image}" style="width: 50px; height: 50px; margin-right:15px" />
  <p>${order.name}</p>
  </div>`;
    amount += `<p style="text-align:center; margin-bottom: 50px">${order.amount}</p>`;
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: process.env.MAIL_ACCOUNT, // sender address
    to: email, // list of receivers
    subject: "Cảm ơn bạn đã đặt hàng tại October16th Store", // Subject line
    text: "Thư cảm ơn", // plain text body
    html: `
    <div>
    <img src="https://media0.giphy.com/media/BPJmthQ3YRwD6QqcVD/giphy.gif" style="border-radius: 12px; width: 500px; height: 300px"; object-fit:"cover" />
    <h2> Cảm ơn bạn đã đặt hàng tại October16th Store </h2>
    <p style="margin: 0px;font-size: 16px">Để cảm ơn sự ủng hộ của bạn, October16th Store xin phép tặng bạn mã giảm giá 20K, vui lòng nhập mã "DUYTHONGDEPTRAI" trước khi tiến hành thanh toán để nhận ưu đãi!</p>
      <p style="font-size: 16px">Bên dưới là thông tin đơn hàng, vui lòng kiểm tra lại có bất kì sai sót nào liên hệ đến chúng tôi qua email này</p>
      <div style="display:flex; width: 500px; border: 1px solid #e4dfdf;padding: 12px;border-radius: 12px;">
            <div class="left" style="margin-right: 200px">
              <h3 style="margin: 0">Sản phẩm</h3>
              ${product}
          </div>
            <div class="right">
              <h3 style="margin: 0">Số lượng</h3>
              <div>
                  ${amount}
              </div>
            </div>
    </div>
    </div>
    `,
  });
};

module.exports = {
  sendEmailCreateOrder,
};
