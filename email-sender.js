var fs = require("fs-extra");
var path = require("path");
var Handlebars = require("handlebars");
var mjml2html = require("mjml");
const nodemailer = require("nodemailer");
require("dotenv").config();

module.exports = class EmailSender {
    templatePath = "/views/";

    async process(data) {
        return new Promise(async (resolve, reject) => {
            const bodySource = await this.loadTemplate("newsletter.hbs");
            const generated = await this.generate(
                process.env.MAIL_FROMADDRESS_EMAIL,
                data.subject,
                bodySource,
                data.templateVars
            );

            const emailDetails = { ...generated, recipient: data.recipient };

            // Trigger mail to recipient
            try {
                const isMailSent = await this.sendMail(
                    emailDetails,
                    this.getSendMailTransport()
                );
                // Update mail delivered once mail delivery is successful
                resolve(isMailSent);
            } catch (e) {
                // re-attempt mail delivery if mail is not sent
                reject(e);
            } finally {
                resolve(false);
            }
        });
    }

    async loadTemplate(templateFileName) {
        const templatePath = path.join(__dirname, `/views/${templateFileName}`);
        const body = await fs.readFile(templatePath, "utf-8");
        return body;
    }

    generate(from, subject, template, templateVars) {
        const compiledFrom = Handlebars.compile(from, { noEscape: true });
        const compiledSubject = Handlebars.compile(subject);
        const compiledTemplate = Handlebars.compile(template);

        const fromResult = compiledFrom(templateVars, {
            allowProtoPropertiesByDefault: true,
        });
        const subjectResult = compiledSubject(templateVars, {
            allowProtoPropertiesByDefault: true,
        });
        const mjml = compiledTemplate(templateVars, {
            allowProtoPropertiesByDefault: true,
        });
        const body = mjml2html(mjml).html;
        return { from: fromResult, subject: subjectResult, body };
    }

    getSendMailTransport() {
        let sendMailTransport = nodemailer.createTransport({
            type: "smtp",
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_USERNAME,
                pass: process.env.SMTP_PASSWORD,
            },
        });
        return sendMailTransport;
    }

    async sendMail(email, transporter) {
        return transporter.sendMail({
            from: email.from,
            to: email.recipient,
            subject: email.subject,
            html: email.body,
        });
    }
};
