import Configs from "../configs/Configs.js";
import { emailTransporter } from "./send.js";
import generateEmailBody from "./body.js";

export async function sendTestEmailOnStartup() {
    if (Configs.email.notifyOnStartup === true) {
        try {
            // Aktuális idő lekérése a konfigurált időzóna és lokalizáció szerint
            const locale = Configs.server.time.locale;
            const timeZone = Configs.server.time.timeZone;
            // Formázott aktuális idő a konfiguráció szerint
            const now = new Intl.DateTimeFormat(locale, {
                timeZone,
                dateStyle: Configs.server.time.dateStyle,
                timeStyle: Configs.server.time.timeStyle,
            }).format(new Date());
            let nowDetailed = new Intl.DateTimeFormat(locale, {
                timeZone,
                year: Configs.server.timeFormating.year,
                month: Configs.server.timeFormating.month,
                day: Configs.server.timeFormating.day,
                hour: Configs.server.timeFormating.hour,
                minute: Configs.server.timeFormating.minute,
                second: Configs.server.timeFormating.second,
            }).format(new Date());
            // Teszt email küldése a konfigurált címre
            await emailTransporter.sendMail({
                from: `${Configs.email.alias.fromName} <${Configs.email.alias.fromAddress}>`,
                to: Configs.email.target,
                
                html: generateEmailBody('startup-notification', Configs.server.defaultLanguage, { time: now, domain: Configs.server.domain() }),
            });
            if (Configs.server.defaultLanguage.toUpperCase() === 'HU') {
                console.log(`${nowDetailed} - Szerver indítási értesítő email sikeresen elküldve`);
            }
            else {
                console.log(`${nowDetailed} - Server startup notification email sent successfully`);
            }    
        }
        catch (error) {
            if (error.response) {
                if (Configs.server.defaultLanguage.toUpperCase() === 'HU') {
                    console.error(`Hiba az indítási értesítő email küldése során: `, error.response);
                } else {
                    console.error("Error sending test email on startup: ", error.response);
                }
            }
            else {
                if (Configs.server.defaultLanguage.toUpperCase() === 'HU') {
                    console.error("Hiba az indítási értesítő email küldése során: ", error.message);
                } else {
                    console.error("Error sending test email on startup: ", error.message);
                }
            }
        }
    }
}

export default sendTestEmailOnStartup;