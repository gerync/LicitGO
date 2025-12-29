import crypto from 'crypto';
import configs from '../configs/Configs.js';

const salt = configs.encryption.hash.salt;
const algorithm = configs.encryption.hash.algorithm;

// hash létrehozása kereshető titkosított mezőkhöz
export default function hashdata(data) {
    let hashedData = crypto.createHash(algorithm);
    hashedData.update(data.toLowerCase() + salt); // kis- és nagybetű érzéketlen hash létrehozása a sóval
    hashedData = hashedData.digest('hex'); // hexadecimális formátumú hash visszaadása
    return hashedData;
    // felhasznált minta: https://tinyurl.com/crypto-createhash
}