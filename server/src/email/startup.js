import Configs from '../configs/Configs.js';
import { emailTransporter } from './send.js';
import generateEmailBody from './body.js';
import { coloredlog } from '@gerync/utils';

export async function sendTestEmailOnStartup() {
    const colors = Configs.colors;
    if (Configs.email.notifyOnStartup === true) {
        try {
            // Aktuális idő lekérése a konfigurált időzóna és lokalizáció szerint
            const locale = Configs.server.time.locale;
            const timeZone = Configs.server.time.timeZone;
            // Formázott aktuális idő a konfiguráció szerint
            let nowDetailed = new Intl.DateTimeFormat(locale, {
                timeZone,
                year: Configs.server.timeFormat.year,
                month: Configs.server.timeFormat.month,
                day: Configs.server.timeFormat.day,
                hour: Configs.server.timeFormat.hour,
                minute: Configs.server.timeFormat.minute,
                second: Configs.server.timeFormat.second,
                hour12: Configs.server.timeFormat.hour12
            }).format(new Date());
            // Teszt email küldése a konfigurált címre
            await emailTransporter.sendMail({
                from: `${Configs.email.alias.fromName} <${Configs.email.alias.fromAddress}>`,
                to: Configs.email.target,
                
                html: generateEmailBody('startup-notification', Configs.server.defaultLanguage, { time: nowDetailed, domain: Configs.server.domain() }),
            });
            if (Configs.server.defaultLanguage === 'HU') {
                coloredlog(`Szerver indítási értesítő email sikeresen elküldve`, colors.email);
            }
            else {
                coloredlog(`Server startup notification email sent successfully`, colors.email);
            }    
        }
        catch (error) {
            if (error.response) {
                if (Configs.server.defaultLanguage === 'HU') {
                    coloredlog(`Hiba az indítási értesítő email küldése során: `, colors.error);
                    coloredlog(error.response, colors.error-stack);
                } else {
                    coloredlog('Error sending test email on startup: ', colors.error);
                    coloredlog(error.response, colors.error-stack);
                }
            }
            else {
                if (Configs.server.defaultLanguage === 'HU') {
                    coloredlog('Hiba az indítási értesítő email küldése során: ', colors.error);
                    coloredlog(error.message, colors.error-stack);
                } else {
                    coloredlog('Error sending test email on startup: ', colors.error);
                    coloredlog(error.message, colors.error-stack);
                }
            }
        }
    }
    else {
        if (Configs.server.defaultLanguage === 'HU') {
            coloredlog('Az indítási értesítő email küldése ki van kapcsolva.', colors.warning);
        } else {
            coloredlog('Startup notification email sending is disabled.', colors.warning);
        }
    }
    coloredlog('='.repeat(50), colors.email);
}

export default sendTestEmailOnStartup;