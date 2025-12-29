import crypto from 'crypto';
import configs from '../configs/Configs.js';

// #region Titkosítási beállítások betöltése
const encryptionkey = configs.encryption.secretKey; // 32 bájtos kulcs szükséges az AES-256-hoz
const algorithm = configs.encryption.algorithm; // titkosítás algoritmusa
const keyEncoding = configs.encryption.keyEncoding; // kulcs kódolása
// #endregion

// #region Adatok titkosítása az AES-256 algoritmussal
export function encryptData(data) {
    const iv = crypto.randomBytes(16); // Véletlenszerű kezdő érték (IV), hogy ugyanaz a bemenet ne adjon mindig azonos titkosított szöveget
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(encryptionkey, keyEncoding), iv); // Titkosító objektum létrehozása
    let encrypted = cipher.update(data, 'utf8', 'hex'); // Adatok titkosítása
    encrypted += cipher.final('hex'); // Titkosítás befejezése
    return iv.toString('hex') + ':' + encrypted; // IV és titkosított szöveg visszaadása kettősponttal elválasztva
    
}
// #endregion

// #region Adatok visszafejtése az AES-256 algoritmussal
export function decryptData(data) {
    const textParts = data.split(':'); // IV és titkosított szöveg szétválasztása
    const iv = Buffer.from(textParts.shift(), 'hex'); // IV visszaállítása
    const encryptedText = Buffer.from(textParts.join(':'), 'hex'); // Titkosított szöveg visszaállítása
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(encryptionkey, keyEncoding), iv); // Visszafejtő objektum létrehozása
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8'); // Adatok visszafejtése
    decrypted += decipher.final('utf8'); // Visszafejtés befejezése
    return decrypted;
}
// #endregion
// felhasznált forrás: https://tinyurl.com/aes-256-encryption
export default { encryptData, decryptData }