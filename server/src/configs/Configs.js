import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(__filename);

// .env betöltése a server/.env helyről
dotenv.config({ path: path.resolve(dirname, '../../.env'), quiet: true });

export default {
    // #region ===== SZERVER KONFIGURÁCIÓK =====
    server: {
        // ↓ A szerver portja (alapértelmezett: 3000)
        port: parseInt(process.env.PORT || 3000),
        // ↓ A szerver domain-je (pl. http://localhost:3000)
        domain: function() {
            // ↓ Biztosítja, hogy a domain tartalmazza a portot, ha szükséges
            let domain = (process.env.DOMAIN || 'http://localhost').toLowerCase();
            // ↓ Hozzáadjuk a portot, ha nincs benne
            // ↓ és a domain helyi (localhost)
            const port = this.port;
            if (port && !domain.includes(`:${port}`) && domain.includes('localhost')) {
                domain += `:${port}`;
            }
            // ↓ Eltávolítja a végső '/' karaktert, ha van
            if (domain.endsWith('/')) {
                domain = domain.slice(0, -1);
            }
            return domain;
        },
        defaultLanguage: (process.env.DEFAULT_LANG || 'HU').toUpperCase(),
        // ↑ Alapértelmezett nyelv
        // ↓ Időzóna és lokalizáció beállítások
        time: {
              timeZone: process.env.TIME_ZONE || 'Europe/Budapest',
              // ↑ Közép-európai idő (CET/CEST)
              locale: process.env.TIME_LOCALE || 'en-GB',
              // ↑ Közép-európai formátum (angol)
              dateStyle: (process.env.TIME_DATE_STYLE || 'short').toLowerCase(),
              // ↑ Dátum stílusa
              // ↓ Idő stílusa
              timeStyle: (process.env.TIME_TIME_STYLE || 'medium').toLowerCase(),
        },
        timeFormat: {
            year: (process.env.TIME_YEAR_FORMAT || 'numeric').toLowerCase(),
            // ↑ Év formátuma
            // ↓ Hónap formátuma
            month: (process.env.TIME_MONTH_FORMAT || '2-digit').toLowerCase(),
            day: (process.env.TIME_DAY_FORMAT || '2-digit').toLowerCase(),
            // ↑ Nap formátuma
            // ↓ Óra formátuma
            hour: (process.env.TIME_HOUR_FORMAT || '2-digit').toLowerCase(),
            minute: (process.env.TIME_MINUTE_FORMAT || '2-digit').toLowerCase(),
            // ↑ Perc formátuma
            // ↓ Másodperc formátuma
            second: (process.env.TIME_SECOND_FORMAT || '2-digit').toLowerCase(),
            hour12: (process.env.TIME_HOUR_12_FORMAT || 'false').toLowerCase() === 'true',
            // ↑ 12 órás formátum használata
        },
        enableErrorlogs: (process.env.ENABLE_ERRORLOGS || 'false').toLowerCase() === 'true',
        // ↑ Hibák naplózása fájlba
    },
    // #endregion
    // #region ===== ADATBÁZIS KONFIGURÁCIÓK =====
    db: {
        host: (process.env.DBHOST || 'localhost').toLowerCase(),
        // ↑ MySQL szerver hosztja
        user: process.env.DBUSER || 'root',
        // ↑ Adatbázis felhasználó
        password: (process.env.DBPASS || '').toString(),
        // ↑ Adatbázis jelszó
        name: (process.env.DBNAME || 'licitgo').toString(),
        // ↑ Adatbázis neve
        port: parseInt(process.env.DBPORT || 3306),
        // ↑ MySQL port (alapértelmezett: 3306)
    },
    // #endregion
    // #region ===== BIZTONSÁGI TITKOK =====
    cookieSecret: (process.env.COOKIESECRET || '0123456789abcdef0123456789abcdef').toString(),  // Cookie aláíráshoz használt titkos kulcs
    jwtSecret: (process.env.JWTSECRET || '0123456789abcdef0123456789abcdef').toString(),        // JWT token aláíráshoz használt titkos kulcs
    // #endregion
    // #region ===== EMAIL KONFIGURÁCIÓK =====
    email: {
        host: (process.env.EMAILHOST || 'smtp.gmail.com').toLowerCase(),
        // ↑ SMTP szerver címe (pl. smtp.gmail.com)
        port: parseInt(process.env.EMAILPORT || 587),
        // ↑ SMTP port: 587 = TLS, 465 = SSL
        user: (process.env.EMAILUSER || 'user@example.com').toString(),
        // ↑ Email cím a bejelentkezéshez
        pass: (process.env.EMAILPASS || 'password').toString(),
        // ↑ Email jelszó vagy applikáció jelszó
        secure: function() {
            if (this.port == 465) {
                return true;
            }
            return false;
        },
        // ⇅ SSL/TLS biztonság aktiválása
        // ⇅ Port 465 = SSL (biztonságos kapcsolat azonnal)
        // ⇅ Port 587 = TLS (STARTTLS - biztonságot később aktiválja)
        requireTLS: function() {
            if (this.port == 587) {
                return true;
            }
            return false;
        },
        notifyOnStartup: (process.env.NOTY_ON_START || 'false').toLowerCase() === "true",
        // ↑ Értesítés email küldése szerver indításkor
        target: (process.env.NOTY_TARGET || 'example@example.com').toLowerCase(),
        // ↑ Értesítési email cím szerver indításkor
        alias: {
            fromName: (process.env.EMAIL_ALIAS_FROM_NAME || 'LicitGO'),
            // ↑ Email küldő neve
            fromAddress: (process.env.EMAIL_ALIAS_FROM_ADDRESS || 'example@example.com').toLowerCase(),
            // ↑ Email küldő címe
        }
    },
    // #endregion
    // #region ===== ADATTITKOSÍTÁSI KONFIGURÁCIÓK =====
    encryption: {
        algorithm: (process.env.ENCRYPTALG || 'aes-256-cbc').toLowerCase(),
        // ↑ Titkosítási algoritmus (AES-256 CBC mód)
        secretKey: (process.env.ENCRYPTKEY || '0123456789abcdef0123456789abcdef'),
        // ↑ 32 karakteres titkosítási kulcs
        keyEncoding: (process.env.ENCRYPTENC || 'utf8').toLowerCase(),
        // ↑ Kulcs kódolása
        hash: {
            salt: (process.env.HASHSALT || 'HASHSALTASDASDA'),
            // ↑ Hasheléshez használt 'só'
            algorithm: (process.env.HASHALG || 'sha256').toLowerCase(),
            // ↑ Hashelési algoritmus
        }
    },
    // #endregion
    // #region ===== ADMIN FELHASZNÁLÓ ALAPÉRTELMEZETI ADATAI =====
    baseadmin: {
        usertag: (process.env.BA_UT || 'admin').toLowerCase(),
        // ↑ Admin felhasználónév
        email: (process.env.BA_E || 'admin@example.com').toLowerCase(),
        // ↑ Admin email cím
        fullname: (process.env.BA_FN || 'Administrator'),
        // ↑ Admin teljes neve
        password: (process.env.BA_PW || 'adminpassword'),
        // ↑ Admin jelszó (első bejelentkezéskor ajánlott megváltoztatni!)
        gender: (process.env.BA_G || 'male').toLowerCase(),
        // ↑ Admin neme
        birthdate: (process.env.BA_BD || '1990-01-01'),
        // ↑ Admin születési dátuma
        mobile: (process.env.BA_M || '+0000000000'),
        // ↑ Admin telefonszáma
    },
    // #endregion
    // #region ===== KÖRNYEZETI BEÁLLÍTÁSOK =====
    environment: {
        nodeEnv: (process.env.NODE_ENV || 'development').toLowerCase(),                           // Node.js környezet (development, production)
        isProduction: (process.env.NODE_ENV || 'development').toLowerCase() === 'production'    // Éles környezet-e?
    },
    // #endregion
    // #region ===== ÁRFOLYAM API KONFIGURÁCIÓK =====
    exchange: {
        apiKey: (process.env.EXCHANGE_API_KEY || 'API_KEY_PLACEHOLDER'),
        // ↑ Árfolyam API kulcs
        apiUrl: (process.env.EXCHANGE_API_URL || 'https://v6.exchangerate-api.com/v6/*/latest/').toLowerCase(),
        // ↑ Árfolyam API URL (* helyére az API kulcs kerül)
        apiFullUrl: function() {
            // ↓ Kicseréli a '*' helyőrzőt az API kulcsra
            return this.apiUrl.replace('*', this.apiKey);
        },
        // ↓ exchangeRates.json maximális hossza
        jsonmaxlenght: parseInt(process.env.EXCHANGE_JSON_MAX_LENGTH || 187) 
    },
    // #endregion
    // #region ===== JELSZÓ VISSZAÁLLÍTÁS KONFIGURÁCIÓK =====
    passwordReset: {
        expiryMinutes:  parseInt(process.env.PW_RESET_EXP_MINS || 10) 
        // ↑ Jelszó visszaállító kód érvényességi ideje percben
    },
    // #endregion
    // #region ===== EMAIL VERIFIKÁCIÓ / VÁLTÁS KONFIGURÁCIÓK =====
    emailVerification: {
        expiryMinutes: parseInt(process.env.EMAIL_VERIF_EXP_MINS || 30)
        // ↑ Regisztráció utáni email hitelesítő kód érvényességi ideje percben
    },
    emailChange: {
        expiryMinutes: parseInt(process.env.EMAIL_CHANGE_EXP_MINS || 15)
        // ↑ Email-cím váltási kód érvényességi ideje percben
    },
    // #endregion
    // #region ===== KÉPKEZELÉSI KONFIGURÁCIÓK =====
    images: {
        maxsizeMB: parseInt(process.env.IMG_MAX_SIZE_MB || 5),
         // ↑ Maximális kép méret MB-ban
        maxwidthPX: parseInt(process.env.IMG_MAX_WIDTH_PX || 5000), 
        // ↑ Maximális kép szélesség pixelben
        maxheightPX: parseInt(process.env.IMG_MAX_HEIGHT_PX || 5000), 
        // ↑ Maximális kép magasság pixelben
        allowedFormats: (process.env.IMG_ALLOWED_FORMATS || 'jpeg,png,gif,webp,jpg,avif').toLowerCase().split(','),
        // ↑ Engedélyezett képformátumok
        minimumFilesUpload: parseInt(process.env.IMG_MIN_FILES_UPLOAD || 1), // Minimális képfájl feltöltés egyszerre
        maximumFilesUpload: parseInt(process.env.IMG_MAX_FILES_UPLOAD || 30) // Maximális képfájl feltöltés egyszerre
    },
    // #endregion
    // #region ===== KONZOL SZÍNEI =====
    colors: JSON.parse(fs.readFileSync(path.resolve(dirname, './coloring.json'), 'utf8'))
    // ↑ Színek a konzol naplózáshoz
    // #endregion
};