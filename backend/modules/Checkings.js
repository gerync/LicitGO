async function CheckAPIKey(apiKey) {
    if (!apiKey || apiKey !== await app.db.query('SELECT api_key FROM api_keys WHERE api_key = ?', [apiKey]).then(([rows]) => rows.length > 0 ? rows[0].api_key : null)) {
        return false;
    }
    return true;
}
async function CheckSessionToken(sessionToken) {
    if (!sessionToken || sessionToken !== await app.db.query('SELECT session_token FROM sessions WHERE session_token = ?', [sessionToken]).then(([rows]) => rows.length > 0 ? rows[0].session_token : null)) {
        return false;
    }
    else {
        isTokenValid = await app.db.query('SELECT expires_at FROM sessions WHERE session_token = ?', [sessionToken]).then(([rows]) => {
            if (rows.length === 0) return false;
            const expiresAt = new Date(rows[0].expires_at);
            return (expiresAt > new Date());
        });
        return isTokenValid;
    }
}
function CheckFileType(file) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg', 'image/webp', 'image/bmp', 'image/svg'];
    return file && allowedTypes.includes(file.mimetype);
}

exports = { CheckAPIKey, CheckSessionToken, CheckFileType };