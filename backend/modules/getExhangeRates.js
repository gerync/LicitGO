import dotenv from 'dotenv';
dotenv.config({path: '../.env'});

async function Exchanges(from, to) {
  const res = await fetch(`https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/latest/${from}`);
  const data = await res.json();
    if (data.result === 'success' && data.conversion_rates && data.conversion_rates[to]) {
        return data.conversion_rates[to];
    }
    else {
        console.error('Hiba az árfolyam lekérésekor:', data);
    }
}

export { Exchanges };