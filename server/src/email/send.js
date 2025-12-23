import Configs from "../configs/Configs.js";
import nodemailer from "nodemailer";
// Email küldő transporter létrehozása nodemailer-rel
const emailTransporter = nodemailer.createTransport({
    host: Configs.email.host,
    port: Configs.email.port,
    secure: Configs.email.secure(), // true for 465, false for other ports
    requireTLS: Configs.email.requireTLS(),
    auth: {
        user: Configs.email.user,
        pass: Configs.email.pass,
    }
});

export default async function sendTestEmailOnStartup() {
    if (Configs.email.notifyOnStartup === true) {
        try {
            const locale = Configs.server.time.locale;
            const timeZone = Configs.server.time.timeZone;
            const now = new Intl.DateTimeFormat(locale, {
                timeZone,
                dateStyle: Configs.server.time.dateStyle,
                timeStyle: Configs.server.time.timeStyle,
            }).format(new Date());
            // Teszt email küldése a konfigurált címre
            const info = await emailTransporter.sendMail({
                from: `${Configs.email.alias.fromName} <${Configs.email.alias.fromAddress}>`,
                to: Configs.email.target,
                subject: `LicitGO Server Started at ${now}`,
                text: "The LicitGO server has started successfully and the email configuration is working.",
            });
            console.log(`${now}\n`)
            console.log("Test email sent: %s", info.messageId);
        }
        catch (error) {
            console.error("Error sending test email on startup:", error);
        }
    }
}