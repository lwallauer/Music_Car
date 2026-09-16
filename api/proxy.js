const fetch = require('node-fetch');

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

async function getAccessToken() {
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: REFRESH_TOKEN
        })
    });
    const data = await response.json();
    return data.access_token;
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'GET' && req.query.code) {
            const code = req.query.code;
            const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: 'https://music-car.vercel.app',
                    client_id: CLIENT_ID,
                    client_secret: CLIENT_SECRET
                })
            });
            const tokenData = await tokenRes.json();
            
            return res.status(200).send(`
                <html>
                <body style="background:#121212;color:#fff;font-family:sans-serif;text-align:center;padding-top:40px;">
                    <h2 style="color:#1DB954;">Sucesso absoluto!</h2>
                    <p>Copie o seu <b>Refresh Token</b> abaixo e cole nas Variáveis de Ambiente da Vercel (SPOTIFY_REFRESH_TOKEN):</p>
                    <textarea style="width:85%;height:120px;background:#222;color:#1DB954;font-size:15px;padding:12px;border-radius:8px;border:1px solid #333;" readonly>${tokenData.refresh_token || JSON.stringify(tokenData)}</textarea>
                </body>
                </html>
            `);
        }

        if (req.method === 'GET' && req.query.action === 'search') {
            const accessToken = await getAccessToken();
            const query = req.query.q;
            if (!query) return res.status(400).json({ error: 'Termo vazio' });

            const searchRes = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const searchData = await searchRes.json();
            return res.status(200).json(searchData);
        }

        if (req.method === 'POST') {
            const accessToken = await getAccessToken();
            const { uri } = req.body;
            if (!uri) return res.status(400).json({ error: 'URI ausente' });

            const queueRes = await fetch(`https://api.spotify.com/v1/me/player/queue?uri=${encodeURIComponent(uri)}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            if (queueRes.status === 204 || queueRes.ok) {
                return res.status(200).json({ success: true });
            } else {
                const errData = await queueRes.json();
                return res.status(400).json({ error: 'Deixe o Spotify aberto no celular!', details: errData });
            }
        }

        // Se acessar a raiz sem código, mostra a interface normal ou instrução
        return res.status(200).send('API do Carro ativa e operando!');

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};