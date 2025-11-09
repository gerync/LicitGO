import dotenv from '../node_modules/dotenv/config.js';
async function Exchanges(from, to, amount) {
    const res = await fetch(`https://v6.exchangerate-api.com/v6/${dotenv.EXCHANGE_RATE_API_KEY}/latest/${from}`);
    const data = await res.json();
    for (let i = 0; i < data.conversion_rates.length; i++) {
        if (data.conversion_rates[i] === to) {
            const rate = data.conversion_rates[i];
            return amount * rate;
        }
    }
    return null;
}
export { Exchanges };