const { GMAIL_ADDRESS, GMAIL_APP_PW, AWS_PATH } = require("../config");
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: GMAIL_ADDRESS,
    pass: GMAIL_APP_PW,
  },
});

module.exports = { send };

async function send(mailOptions) {
  const mailTemplate = `<!DOCTYPE html>
  <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <title></title>

    <style>
      table, td, div, h1 {font-weight: normal} p {font-family: Arial, sans-serif}
    </style>
  </head>
  <body style="margin:0;padding:0;">
    <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;">
      <tr>
        <td style="padding:0 0 16px 0;">
          <h1 style="font-weight: 700;color:#000000;font-size:24px;margin:0 0 20px 0;font-family:sans-serif;">${mailOptions.templateH1} code: sll-towing-app</h1>
          <h1 style="color:#000000; font-size:18px;margin:0 0 20px 0;font-family:sans-serif;">In order to ${mailOptions.templateText}, input the following code:</h1>
          <h1 style="font-weight: 700;color:#000000;font-size:24px;margin:0 0 20px 0;font-family:sans-serif;">${mailOptions.token}</h1>
          <h1 style="color:#000000; font-size:18px;margin:0 0 20px 0;font-family:sans-serif;">If you haven't requested this code, it's possible someone else is trying to access your account. In that case, we recommend changing your password. Don't send this code to anyone.</h1>
          <h1 style="color:#000000; font-size:18px;margin:0 0 20px 0;font-family:sans-serif;">Thank you for using the app. </h1>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const info = await transporter.sendMail({
    from: GMAIL_ADDRESS,
    to: mailOptions.to,
    subject: mailOptions.subject,
    html: mailTemplate,
    text: mailOptions.token,
  });
}
