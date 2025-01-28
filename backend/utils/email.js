const nodemailer = require("nodemailer");
const { APP_CONFIG } = require("../config/app.config");

module.exports = class Email {
  constructor(user) {
    this.to = user.email;
    this.firstName = user.firstName;
    this.from = `${APP_CONFIG.EMAIL_NAME} <${APP_CONFIG.EMAIL_FROM}>`;
  }

  newTransport() {
    return nodemailer.createTransport({
      host: APP_CONFIG.EMAIL_HOST,
      port: APP_CONFIG.EMAIL_PORT,
      auth: {
        user: APP_CONFIG.EMAIL_USERNAME,
        pass: APP_CONFIG.EMAIL_PASSWORD,
      },
    });
  }

  async send(subject) {
    const mailOptions = {
      to: this.to,
      from: this.from,
      subject,
    };
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send("Welcome!");
  }
};
