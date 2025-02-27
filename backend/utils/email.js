const nodemailer = require("nodemailer");
const pug = require("pug");
const juice = require("juice");
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
    if (process.env.NODE_ENV === "production") {
      return nodemailer.createTransport({
        host: APP_CONFIG.BREVO_HOST,
        port: APP_CONFIG.BREVO_PORT,
        secure: false, // True for 465, false for other ports
        requireTLS: true,
        auth: {
          user: APP_CONFIG.BREVO_USERNAME,
          pass: APP_CONFIG.BREVO_PASSWORD,
        },
        tls: {
          ciphers: "SSLv3",
        },
      });
    }

    return nodemailer.createTransport({
      host: APP_CONFIG.EMAIL_HOST,
      port: APP_CONFIG.EMAIL_PORT,
      auth: {
        user: APP_CONFIG.EMAIL_USERNAME,
        pass: APP_CONFIG.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject, _content = "") {
    try {
      const transport = this.newTransport();

      // Add transport event listeners
      transport.on("log", console.log);
      transport.on("envelope", (envelope) => {
        console.log("Envelope:", envelope);
      });

      const html = pug.renderFile(
        `${__dirname}/../views/emails/${template}.pug`,
        {
          firstName: this.firstName,
          url: this.url,
          subject,
          _content: _content,
        }
      );

      const inlinedHtml = juice(html);

      const mailOptions = {
        from: this.from,
        to: this.to,
        subject,
        html: inlinedHtml,
        text: htmlToText(html),
      };

      const info = await transport.sendMail(mailOptions);
      console.log("Message sent: %s", info.messageId);
    } catch (error) {
      console.error("Full error details:", error);
      throw new Error(`Email sending failed: ${error.message}`);
    }
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

  async sendVerifyEmail() {
    await this.send(
      "verifyEmail",
      "Your email verification token (valid for only 10 minutes)"
    );
  }

  async resendVerifyEmail() {
    await this.send(
      "verifyEmail",
      "Resend: Your email verification token (valid for only 10 minutes)"
    );
  }

  async sendContactAcknowledgement() {
    await this.send(
      "contactAcknowledgement",
      "WatchLok: We've Received Your Message"
    );
  }

  async sendContactReply(_content) {
    await this.send(
      "contactReply",
      "WatchLok: Reply to Your Message",
      _content
    );
  }

  async sendApprovedSeller() {
    await this.send("approvedSeller", "Watchlok: Your status as seller");
  }

  async sendRejectedSeller() {
    await this.send("rejectedSeller", "Watchlok: Your status as seller");
  }
};
