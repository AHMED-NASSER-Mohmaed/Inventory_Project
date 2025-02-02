const nodemailer = require("nodemailer");
const pug = require("pug");
const { htmlToText } = require("html-to-text");
const { APP_CONFIG } = require("../config/app.config");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.firstName;
    this.from = `${APP_CONFIG.EMAIL_NAME} <${APP_CONFIG.EMAIL_FROM}>`;
    this.url = url;
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

  async send(template, subject) {
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );
    const mailOptions = {
      to: this.to,
      from: this.from,
      subject,
      html,
      text: htmlToText(html),
    };
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send("welcome", "Welcome!");
  }

  async sendPasswordReset() {
    await this.send(
      "passwordReset",
      "Your password reset code (valid for only 10 minutes)"
    );
  }

  async sendPasswordResetSuccess() {
    await this.send("resetSuccess", "Password Reset Successful");
  }
};
