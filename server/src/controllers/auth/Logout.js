// Kijelentkezés: auth süti törlése
import configs from '../../configs/Configs.js';

export default async function Logout(req, res) {
    // #region Nyelvi beállítás lekérése, auth süti létezésének ellenőrzése - már bejelentkezettvan-e
    const lang = req.lang;
    const authToken = req.cookies.auth;
    if (!authToken) {
        throw new Error([ lang === 'HU' ? 'Nincs bejelentkezve.' : 'You are not logged in.', 400 ]);
    }
    // #endregion

    // Build cookie options to match login so clearCookie targets same scope
    let cookieOpts = { sameSite: 'lax', secure: configs.environment.isProduction };
    try {
        const serverDomain = configs.server.domain();
        const url = new URL(serverDomain);
        const host = url.hostname || null;
        if (host) {
            const topDomain = host.replace(/^www\./, '');
            cookieOpts.domain = '.' + topDomain;
        }
    } catch (e) {
        // ignore
    }
    if (configs.environment.isProduction) {
        cookieOpts.sameSite = 'none';
        cookieOpts.secure = true;
    }

    // Clear all auth-related cookies (auth is httpOnly)
    res.clearCookie('auth', { ...cookieOpts, httpOnly: true });
    res.clearCookie('usertag', cookieOpts);
    res.clearCookie('language', cookieOpts);
    res.clearCookie('darkmode', cookieOpts);
    res.clearCookie('currency', cookieOpts);

    return res.status(200).json({ message: lang === 'HU' ? 'Sikeres kijelentkezés.' : 'Logout successful.' });
}