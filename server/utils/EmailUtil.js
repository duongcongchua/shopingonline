
const nodemailer = require('nodemailer');
const MyConstants = require('./MyConstants');

const EmailUtil = {

  async send(to, id, token) {
    try {
      if (
        !MyConstants.EMAIL_USER ||
        !MyConstants.EMAIL_PASS
      ) {
        console.error(
          'Email configuration is missing in .env'
        );
        return false;
      }

      const transporter = nodemailer.createTransport({
        host: MyConstants.SMTP_HOST,
        port: MyConstants.SMTP_PORT,
        secure: false,
        requireTLS: true,

        auth: {
          user: MyConstants.EMAIL_USER,
          pass: MyConstants.EMAIL_PASS
        },

        tls: {
          minVersion: 'TLSv1.2'
        }
      });

      const url =
        MyConstants.CUSTOMER_URL +
        '/active?id=' +
        encodeURIComponent(String(id)) +
        '&token=' +
        encodeURIComponent(token);

      const mailOptions = {
        from: MyConstants.EMAIL_USER,
        to: to,

        subject: 'Shopping Online - Activate Account',

        text:
          'Welcome to Shopping Online!\n\n' +
          'Your account ID: ' + id + '\n' +
          'Your activation token: ' + token + '\n\n' +
          'Open this link to activate your account:\n' +
          url,

        html: `
          <div style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: auto;
            padding: 20px;
          ">
            <h2>Shopping Online</h2>

            <h3>Activate your account</h3>

            <p>
              Thank you for registering
              an account at Shopping Online.
            </p>

            <p>
              Click the button below to
              activate your account.
            </p>

            <p style="margin: 30px 0;">
              <a
                href="${url}"
                style="
                  padding: 12px 20px;
                  background: #2563eb;
                  color: white;
                  text-decoration: none;
                  border-radius: 6px;
                "
              >
                ACTIVATE ACCOUNT
              </a>
            </p>

            <p>
              <b>Account ID:</b>
              ${id}
            </p>

            <p>
              <b>Activation token:</b>
              ${token}
            </p>

            <p>
              If you did not register,
              please ignore this message.
            </p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);

      console.log('Activation email submitted');

      return true;

    } catch (error) {
      console.error(
        'Email sending failed:',
        error.message
      );

      return false;
    }
  }

};

module.exports = EmailUtil;
