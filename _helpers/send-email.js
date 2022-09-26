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
    <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;background:#ffffff;">
      <tr>
        <td align="center" style="padding:0;">
          <table role="presentation" style="width:700px;border-collapse:collapse;border:1px solid #cccccc;border-spacing:0;text-align:left;">
            <tr>
              <td align="center" style="padding:40px 0 40px 0;background:#444A50;">
                <img src="cid:gruaLogo" alt="test" width="100" style="height:auto;display:block;" />
              </td>
            </tr>
            <tr>
              <td style="padding:50px 30px 42px 50px; background-color:white;">
                <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;">
                  <tr>
                    <td style="padding:0 0 16px 0;">
                      <h1 style="font-weight: 700;color:#000000;font-size:24px;margin:0 0 20px 0;font-family:sans-serif;">Código de ${mailOptions.templateH1} de GruOut</h1>
                      <h1 style="color:#000000; font-size:18px;margin:0 0 20px 0;font-family:sans-serif;">Recibimos tu solicitud. Para ${mailOptions.templateText}, ingresa el siguiente código dentro de la aplicación:</h1>
                      <h1 style="font-weight: 700;color:#000000;font-size:24px;margin:0 0 20px 0;font-family:sans-serif;">${mailOptions.token}</h1>
                      <h1 style="color:#000000; font-size:18px;margin:0 0 20px 0;font-family:sans-serif;">Si no solicitaste este código, es posible que otra persona esté intentando acceder a tu cuenta de GruOut. En ese caso recomendamos ingresar a la aplicación y cambiar la clave de tu usuario. No reenvíes ni des este código a nadie.</h1>
                      <h1 style="color:#000000; font-size:18px;margin:0 0 20px 0;font-family:sans-serif;">Muchas gracias, </h1>
                      <h1 style="color:#000000; font-size:18px;margin:0 0 20px 0;font-family:sans-serif;">El equipo de cuentas de GruOut.</h1>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          <tr>
              <td style="flex:1;flex-direction:row;padding:30px;background:#444A50; padding-top:100px;align-items: center;">
                <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;font-size:9px;font-family:Arial,sans-serif;">
                  <div style="text-align: center;">
                      <a href="https://www.facebook.com/gruout"  style="margin-right:10px;display:inline-block;line-height: 40px;background-color: #E6E950;border-radius: 20px; width: 40px;height: 40px;text-align: center; vertical-align: bottom; text-decoration: none; color:#444A50;">
                        <img src="cid:facebookLogo" style="display:inline-block;line-height: 25px;background-color: #E6E950;border-radius: 25px; width: 25px;height: 25px;text-align: center; vertical-align: middle; text-decoration: none; color:#444A50;"></img>
                      </a>
                      <a href="http://www.gruout.com.ar/"style="margin-right:10px;display:inline-block;line-height: 40px;background-color: #E6E950;border-radius: 20px; width: 40px;height: 40px;text-align: center; vertical-align: bottom; text-decoration: none; color:#444A50;">
                        <img src="cid:globe-solidLogo" style="display:inline-block;line-height: 25px;background-color: #E6E950;border-radius: 25px; width: 25px;height: 25px;text-align: center; vertical-align: middle; text-decoration: none; color:#444A50;"></img>
                      </a>
                      <a href="https://www.instagram.com/gruout_oficial/" style="display:inline-block;line-height: 40px;background-color: #E6E950;border-radius: 20px; width: 40px;height: 40px;text-align: center; vertical-align: bottom; text-decoration: none; color:#444A50;">
                        <img src="cid:instagramLogo" style="display:inline-block;line-height: 25px;background-color: #E6E950;border-radius: 25px; width: 25px;height: 25px;text-align: center; vertical-align: middle; text-decoration: none; color:#444A50;"></img>
                      </a>
                  </div>
              </td>
          </tr>
          </table>
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
    attachments: [
      {
        filename: "logo_grua.png",
        path: `${AWS_PATH}/icons/logo_grua.png`,
        cid: "gruaLogo",
      },
      {
        filename: "facebook.png",
        path: `${AWS_PATH}/icons/facebook.png`,
        cid: "facebookLogo",
      },
      {
        filename: "globe-solid.png",
        path: `${AWS_PATH}/icons/globe-solid.png`,
        cid: "globe-solidLogo",
      },
      {
        filename: "instagram.png",
        path: `${AWS_PATH}/icons/instagram.png`,
        cid: "instagramLogo",
      },
    ],
  });
}
