import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';

dotenv.config({ path: path.resolve(__dirname, './.env') });

export default {
    server: {
        port: process.env.PORT || 3000,
        domain: process.env.DOMAIN || 'localhost'
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
    }
};