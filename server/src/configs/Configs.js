import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../') });

export default {
    server: {
        port: process.env.PORT || 3000,
        domain: function() {
            // Biztosítjuk, hogy a domain tartalmazza a portot, ha szükséges
            let domain = process.env.DOMAIN || 'http://localhost';
            // Hozzáadjuk a portot, ha nincs benne
            const port = this.port;
            if (port && !domain.includes(`:${port}`)) {
                domain += `:${port}`;
            }
            return domain;
        }
    },
    db: {
        host: process.env.DBHOST || 'localhost',
        user: process.env.DBUSER || 'root',
        password: process.env.DBPASSWORD || '',
        name: process.env.DBNAME || 'licitgo',
        port: process.env.DBPORT || 3306,
    },
    cookieSecret: process.env.COOKIESECRET || '0123456789abcdef0123456789abcdef',
    jwtSecret: process.env.JWTSECRET || '0123456789abcdef0123456789abcdef',
    email: {
        host: process.env.EMAILHOST || 'smtp.example.com',
        port: process.env.EMAILPORT || 587,
        user: process.env.EMAILUSER || 'user@example.com',
        pass: process.env.EMAILPASS || 'password',
    },
    encryption: {
        algorithm: process.env.ENCRYPTIONALGORITHM || 'aes-256-cbc',
        secretKey: process.env.ENCRYPTIONSECRET_KEY || '0123456789abcdef0123456789abcdef',
        keyEncoding: process.env.ENCRYPTIONKEYENCODING || 'utf8',
    },
    baseadmin: {
        usertag: process.env.BASEADMIN_USERTAG || 'admin',
        email: process.env.BASEADMIN_EMAIL || 'admin@example.com',
        fullname: process.env.BASEADMIN_FULLNAME || 'Administrator',
        password: process.env.BASEADMIN_PASSWORD || 'adminpassword',
        gender: process.env.BASEADMIN_GENDER || 'male',
        birthdate: process.env.BASEADMIN_BIRTHDATE || '1990-01-01',
        mobile: process.env.BASEADMIN_MOBILE || '+0000000000',
    },
    environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        isProduction: (process.env.NODE_ENV || 'development') === 'production'
    },
    exchange: {
        apiKey: process.env.EXCHANGE_API_KEY || 'API_KEY_PLACEHOLDER',
        apiUrl: process.env.EXCHANGE_API_URL || 'https://v6.exchangerate-api.com/v6/*/latest/HUF',
        apiFullUrl: function() {
            // Kicseréljük a '*' helyőrzőt az API kulcsra
            return this.apiUrl.replace('*', this.apiKey);
        }
    }
};