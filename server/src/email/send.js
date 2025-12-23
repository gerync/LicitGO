import Configs from "../configs/Configs.js";
import nodemailer from "nodemailer";
import generateEmailBody from "./body.js";
// Email küldő transporter létrehozása nodemailer-rel
export const emailTransporter = nodemailer.createTransport({
    host: Configs.email.host,
    port: Configs.email.port,
    secure: Configs.email.secure(), // true for 465, false for other ports
    requireTLS: Configs.email.requireTLS(),
    auth: {
        user: Configs.email.user,
        pass: Configs.email.pass,
    }
});



export async function sendEmail(to, subject, info, type, lang) {
    const mailOptions = {
        from: `${Configs.email.alias.fromName} <${Configs.email.alias.fromAddress}>`,
        to: to,
        subject: subject,
        html: generateEmailBody(type, lang, info),
    };
    return await emailTransporter.sendMail(mailOptions);
}