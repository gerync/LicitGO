import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname pótlása ES modulokban
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// .env betöltése a server/.env helyről
dotenv.config({ path: path.resolve(dirname, '../../.env') });

export default {
    // #region ===== SZERVER KONFIGURÁCIÓK =====
    server: {
        // A szerver portja (alapértelmezett: 3000)
        port: process.env.PORT || 3000,
        // A szerver domain-je (pl. http://localhost:3000)
        domain: function() {
            // Biztosítjuk, hogy a domain tartalmazza a portot, ha szükséges
            let domain = process.env.DOMAIN || 'http://localhost';
            // Hozzáadjuk a portot, ha nincs benne
            const port = this.port;
            if (port && !domain.includes(`:${port}`)) {
                domain += `:${port}`;
            }
            return domain;
        },
        time: {
              timeZone: process.env.TIME_ZONE || 'Europe/Budapest',          // Közép-európai idő (CET/CEST)
              locale: process.env.TIME_LOCALE || 'en-GB',        // Közép-európai formátum (angol)
              dateStyle: process.env.TIME_DATE_STYLE || 'short',  // Dátum stílusa
              timeStyle: process.env.TIME_TIME_STYLE || 'medium', // Idő stílusa
        },
        timeFormating: {
            year: process.env.TIME_YEAR_FORMAT || 'numeric', // Év formátuma
            month: process.env.TIME_MONTH_FORMAT || '2-digit', // Hónap formátuma
            day: process.env.TIME_DAY_FORMAT || '2-digit',     // Nap formátuma
            hour: process.env.TIME_HOUR_FORMAT || '2-digit',   // Óra formátuma
            minute: process.env.TIME_MINUTE_FORMAT || '2-digit', // Perc formátuma
            second: process.env.TIME_SECOND_FORMAT || '2-digit', // Másodperc formátuma
        }
    },
    // #endregion
    // #region ===== ADATBÁZIS KONFIGURÁCIÓK =====
    db: {
        host: process.env.DBHOST || 'localhost',        // MySQL szerver hosztja
        user: process.env.DBUSER || 'root',             // Adatbázis felhasználó
        password: process.env.DBPASS || '',         // Adatbázis jelszó
        name: process.env.DBNAME || 'licitgo',          // Adatbázis neve
        port: process.env.DBPORT || 3306,               // MySQL port (alapértelmezett: 3306)
    },
    // #endregion
    // #region ===== BIZTONSÁGI TITKOK =====
    cookieSecret: process.env.COOKIESECRET || '0123456789abcdef0123456789abcdef',  // Cookie aláíráshoz használt titkos kulcs
    jwtSecret: process.env.JWTSECRET || '0123456789abcdef0123456789abcdef',        // JWT token aláíráshoz használt titkos kulcs
    // #endregion
    // #region ===== EMAIL KONFIGURÁCIÓK =====
    email: {
        host: process.env.EMAILHOST || 'smtp.example.com',     // SMTP szerver címe (pl. smtp.gmail.com)
        port: process.env.EMAILPORT || 587,                    // SMTP port: 587 = TLS, 465 = SSL
        user: process.env.EMAILUSER || 'user@example.com',     // Email cím a bejelentkezéshez
        pass: process.env.EMAILPASS || 'password',             // Email jelszó vagy applikáció jelszó
        // SSL/TLS biztonság aktiválása
        // Port 465 = SSL (biztonságos kapcsolat azonnal)
        // Port 587 = TLS (STARTTLS - biztonságot később aktiválja)
        secure: function() {
            if (this.port == 465) {
                return true;  // SSL - biztonságos kapcsolat azonnal
            }
            return false;     // TLS - biztonságos kapcsolat később
        },
        // TLS szükségessé tétele (csak 587-es port esetén)
        requireTLS: function() {
            if (this.port == 587) {
                return true;  // TLS kötelező
            }
            return false;
        },
        notifyOnStartup: process.env.NOTY_ON_START ? true : false, // Értesítés email küldése szerver indításkor
        target: process.env.NOTY_TARGET || 'example@example.com', // Értesítési email cím szerver indításkor
        alias: {
            fromName: process.env.EMAIL_ALIAS_FROM_NAME || 'LicitGO',        // Email küldő neve
            fromAddress: process.env.EMAIL_ALIAS_FROM_ADDRESS || 'example@example.com', // Email küldő címe
        }
    },
    // #endregion
    // #region ===== ADATTITKOSÍTÁSI KONFIGURÁCIÓK =====
    encryption: {
        algorithm: process.env.ENCRYPTALG || 'aes-256-cbc',     // Titkosítási algoritmus (AES-256 CBC mód)
        secretKey: process.env.ENCRYPTKEY || '0123456789abcdef0123456789abcdef', // 32 karakteres titkosítási kulcs
        keyEncoding: process.env.ENCRYPTENC || 'utf8',          // Kulcs kódolása
    },
    // #endregion
    // #region ===== ADMIN FELHASZNÁLÓ ALAPÉRTELMEZETI ADATAI =====
    baseadmin: {
        usertag: process.env.BA_UT || 'admin',                      // Admin felhasználónév
        email: process.env.BA_E || 'admin@example.com',             // Admin email cím
        fullname: process.env.BA_FN || 'Administrator',             // Admin teljes neve
        password: process.env.BA_PW || 'adminpassword',             // Admin jelszó (első bejelentkezéskor kötelezően megváltoztatandó!)
        gender: process.env.BA_G || 'male',                         // Admin neme
        birthdate: process.env.BA_BD || '1990-01-01',              // Admin születési dátuma
        mobile: process.env.BA_M || '+0000000000',                  // Admin telefonszáma
    },
    // #endregion
    // #region ===== KÖRNYEZETI BEÁLLÍTÁSOK =====
    environment: {
        nodeEnv: process.env.NODE_ENV || 'development',                           // Node.js környezet (development, production)
        isProduction: (process.env.NODE_ENV || 'development') === 'production'    // Éles környezet-e?
    },
    // #endregion
    // #region ===== ÁRFOLYAM API KONFIGURÁCIÓK =====
    exchange: {
        apiKey: process.env.EXCHANGE_API_KEY || 'API_KEY_PLACEHOLDER',   // Árfolyam API kulcs
        apiUrl: process.env.EXCHANGE_API_URL || 'https://v6.exchangerate-api.com/v6/*/latest/', // Árfolyam API URL (* helyére az API kulcs kerül)
        apiFullUrl: function() {
            // Kicseréli a '*' helyőrzőt az API kulcsra
            return this.apiUrl.replace('*', this.apiKey);
        }
    }
    // #endregion
};