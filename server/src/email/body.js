import implementEmailStyle from "./style.js";

export default function generateEmailBody(type, lang, info) {
    let html = '';
    let now = new Date();
    now = now.toISOString();
    now = now.replace('T', ' ').substring(0, 19);
    switch (type) {
        case 'verification':
            if (lang.toUpperCase() === 'HU') {
                html = `<div class="body">
                    <p class="header">Kedves Felhasználó!</p>
                        <div class="content">
                        <p>Az alábbi kód segítségével hitelesítheti email címét:</p>
                        <h2 class="code">${info.code}</h2>
                            <p>Ha nem Ön hozta létre ezt a kódot, kérjük, hagyja figyelmen kívül ezt az emailt.</p>
                        </div>
                            <p class="footer">Köszönjük, hogy a LicitGO-t használja!</p>
                    </div>`;
            } else {
                html = `<div class="body">
                    <p class="header">Dear User,</p>
                        <div class="content">
                        <p>Please verify your email address using the code below:</p>
                        <h2 class="code">${info.code}</h2>
                            <p>If you did not request this code, please ignore this email.</p>
                        </div>
                            <p class="footer">Thank you for using LicitGO!</p>
                    </div>`;
            }
            break;
        case 'reset-password':
            if (lang.toUpperCase() === 'HU') {
                html = `<div class="body">
                    <p class="header">Kedves Felhasználó!</p>
                        <div class="content">
                        <p>Az alábbi kód segítségével állíthatja vissza jelszavát:</p>
                        <h2 class="code">${info.code}</h2>
                            <p>Ha nem Ön kérte ezt a kódot, kérjük, hagyja figyelmen kívül ezt az emailt.</p>
                        </div>
                            <p class="footer">Köszönjük, hogy a LicitGO-t használja!</p>
                    </div>`;

            } else {
                html = `<div class="body">
                    <p class="header">Dear User,</p>
                        <div class="content">
                        <p>You can reset your password using the code below:</p>
                        <h2 class="code">${info.code}</h2>
                            <p>If you did not request this code, please ignore this email.</p>
                        </div>
                            <p class="footer">Thank you for using LicitGO!</p>
                    </div>`;
            }
            break;
        case 'switch-email':
            if (lang.toUpperCase() === 'HU') {
                html = `<div class="body">
                    <p class="header">Kedves Felhasználó!</p>
                        <div class="content">
                        <p>Az alábbi kód segítségével erősítheti meg új email címét:</p>
                        <h2 class="code">${info.code}</h2>
                            <p>Ha nem Ön kérte ezt a kódot, kérjük, hagyja figyelmen kívül ezt az emailt.</p>
                        </div>
                            <p class="footer">Köszönjük, hogy a LicitGO-t használja!</p>
                    </div>`;
            } else {
                html = `<div class="body">
                    <p class="header">Dear User,</p>
                        <div class="content">
                        <p>Please confirm your new email address using the code below:</p>
                        <h2 class="code">${info.code}</h2>
                            <p>If you did not request this code, please ignore this email.</p>
                        </div>
                            <p class="footer">Thank you for using LicitGO!</p>
                    </div>`;
            }
            break;
        case 'enable-2fa':
            if (lang.toUpperCase() === 'HU') {
                html = `<div class="body">
                    <p class="header">Kedves Felhasználó!</p>
                        <div class="content">
                        <p>Az alábbi kód segítségével engedélyezheti a kétlépcsős azonosítást fiókjában:</p>
                        <h2 class="code">${info.code}</h2>
                            <p>Ha nem Ön kérte ezt a kódot, kérjük, hagyja figyelmen kívül ezt az emailt.</p>
                        </div>
                            <p class="footer">Köszönjük, hogy a LicitGO-t használja!</p>
                    </div>`;
            } else {
                html = `<div class="body">
                    <p class="header">Dear User,</p>
                        <div class="content">
                        <p>You can enable two-factor authentication for your account using the code below:</p>
                        <h2 class="code">${info.code}</h2>
                            <p>If you did not request this code, please ignore this email.</p>
                        </div>
                            <p class="footer">Thank you for using LicitGO!</p>
                    </div>`;
            }
            break;
        case 'disable-2fa':
            if (lang.toUpperCase() === 'HU') {
                html = `<div class="body">
                    <p class="header">Kedves Felhasználó!</p>
                        <div class="content">
                        <p>Az alábbi kód segítségével kikapcsolhatja kétlépcsős azonosítását:</p>
                        <h2 class="code">${info.code}</h2>
                            <p>Ha nem Ön kérte ezt a kódot, kérjük, hagyja figyelmen kívül ezt az emailt.</p>
                        </div>
                            <p class="footer">Köszönjük, hogy a LicitGO-t használja!</p>
                    </div>`;
            } else {
                html = `<div class="body">
                    <p class="header">Dear User,</p>
                        <div class="content">
                        <p>You can disable your two-factor authentication using the code below:</p>
                        <h2 class="code">${info.code}</h2>
                            <p>If you did not request this code, please ignore this email.</p>
                        </div>
                            <p class="footer">Thank you for using LicitGO!</p>
                    </div>`;
            }
            break;
        case 'your-auction-ended':
            if (lang.toUpperCase() === 'HU') {
                html = `<div class="body">
                    <p class="header">Kedves Felhasználó!</p>
                        <div class="content">
                        <p>Az Ön által létrehozott aukció véget ért:</p>
                        <h2>${info.CarManufacturer} ${info.CarModel}</h2>
                        <p>Aukció nyertese: ${info.WinnerName} (${info.WinnerEmail})</p>
                        <p>Végső ár: ${info.FinalPrice}${info.currency}</p>
                        </div>
                            <p class="footer">Köszönjük, hogy a LicitGO-t használja!</p>
                    </div>`;
            } else {
                html = `<div class="body">
                    <p class="header">Dear User,</p>
                        <div class="content">
                        <p>Your auction has ended:</p>
                        <h2>${info.CarManufacturer} ${info.CarModel}</h2>
                        <p>Auction Winner: ${info.WinnerName} (${info.WinnerEmail})</p>
                        <p>Final Price: ${info.FinalPrice}${info.currency}</p>
                        </div>
                            <p class="footer">Thank you for using LicitGO!</p>
                    </div>`;
            }
            break;
        case 'you-won-auction':
            if (lang.toUpperCase() === 'HU') {
                html = `<div class="body">
                    <p class="header">Kedves Felhasználó!</p>
                        <div class="content">
                        <p>Gratulálunk! Ön nyerte meg az alábbi aukciót:</p>
                        <h2><a href="${info.AuctionLink}">${info.CarManufacturer} ${info.CarModel}</a></h2>
                        <p>Fizetendő ár: ${info.FinalPrice}${info.currency}</p>
                        </div>
                            <p class="footer">Köszönjük, hogy a LicitGO-t használja!</p>
                    </div>`;
            } else {
                html = `<div class="body">
                    <p class="header">Dear User,</p>
                        <div class="content">
                        <p>Congratulations! You have won the following auction:</p>
                        <h2><a href="${info.AuctionLink}">${info.CarManufacturer} ${info.CarModel}</a></h2>
                        <p>Amount to Pay: ${info.FinalPrice}${info.currency}</p>
                        </div>
                            <p class="footer">Thank you for using LicitGO!</p>
                    </div>`;
            }
            break;
        case 'auction-outbid':
            if (lang.toUpperCase() === 'HU') {
                html = `<div class="body">
                    <p class="header">Kedves Felhasználó!</p>
                        <div class="content">
                        <p>Az alábbi aukción túllépték az Ön ajánlatát:</p>
                        <h2><a href="${info.AuctionLink}">${info.CarManufacturer} ${info.CarModel}</a></h2>
                        <p>Új legmagasabb ajánlat: ${info.NewHighestBid}${info.currency}</p>
                        </div>
                            <p class="footer">Köszönjük, hogy a LicitGO-t használja!</p>
                    </div>`;
            } else {
                html = `<div class="body">
                    <p class="header">Dear User,</p>
                        <div class="content">
                        <p>Your bid has been outbid in the following auction:</p>
                        <h2><a href="${info.AuctionLink}">${info.CarManufacturer} ${info.CarModel}</a></h2>
                        <p>New Highest Bid: ${info.NewHighestBid}${info.currency}</p>
                        </div>
                            <p class="footer">${now}</p>
                    </div>`;
            }
            break;
        case 'startup-notification':
            if (lang.toUpperCase() === 'HU') {
                html = `<div class="body">
                    <p class="header">LicitGO Szerver Indítási Értesítés</p>
                        <div class="content">
                        <p>A <a class="link" href="${info.domain}"> LicitGO </a> szerver sikeresen elindult.</p>
                        </div>
                            <p class="footer">${now}</p>
                    </div>`;
            } else {
                html = `<div class="body">
                    <p class="header">LicitGO Server Startup Notification</p>
                        <div class="content">
                        <p>The LicitGO server has started successfully.</p>
                        </div>
                            <p class="footer">${now}</p>
                    </div>`;
            }
            break;
        default:
            html = '<p>Invalid email type.</p>';
    }
    html = implementEmailStyle(html);
    return html;
}