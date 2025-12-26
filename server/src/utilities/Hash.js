import crypto from 'crypto';

const HASH_SALT = 'licitgo_searchable_hash_salt_v1';

// hash létrehozása kereshető titkosított mezőkhöz
export function hashEmail(email) {
    return crypto.createHash('sha256').update(email.toLowerCase() + HASH_SALT).digest('hex');
}

// hash létrehozása telefonszámokhoz
export function hashMobile(mobile) {
    return crypto.createHash('sha256').update(mobile.toLowerCase() + HASH_SALT).digest('hex');
}

export default {
    hashEmail,
    hashMobile,
};
