// #region Rate limit üzenetek
const messages = {
    register: {
        EN: 'Too many registration attempts, please try again later.',
        HU: 'Túl sok regisztrációs kísérlet, próbálja újra később.'
    },
    login: {
        EN: 'Too many login attempts, please try again later.',
        HU: 'Túl sok bejelentkezési kísérlet, próbálja újra később.'
    },
    verifyTFA: {
        EN: 'Too many 2FA verification attempts, please try again later.',
        HU: 'Túl sok TFA ellenőrzési kísérlet, próbálja újra később.'
    }
};
// #endregion

// #region Rate limit handler lekérő függvény
export function getRateLimitHandler(messageKey) {
    return (req, res) => {
        const lang = (req.cookies?.language || 'EN').toUpperCase();
        const message = messages[messageKey]?.[lang] || messages[messageKey]?.EN || 'Rate limit exceeded.';
        return res.status(429).json({ error: message });
    };
}
// #endregion

export default messages;
