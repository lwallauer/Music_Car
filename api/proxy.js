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
        // Rota mágica para capturar o Refresh Token via Web na Vercel
        if (req.method === 'GET' && req.query.code) {
            const code = req.query.code;
            const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: 'https://music-car.vercel.app/',
                    client_id: CLIENT_ID,
                    client_secret: CLIENT_SECRET
                })
            });
            const tokenData = await tokenRes.json();
            return res.status(200).send(`
                <html>
                <body style="background:#121212;color:#fff;font-family:sans-serif;text-align:center;padding-top:50px;">
                    <h2>Seu Refresh Token foi gerado com sucesso!</h2>
                    <p>Copie o código abaixo e cole nas Variáveis de Ambiente da Vercel (SPOTIFY_REFRESH_TOKEN):</p>
                    <textarea style="width:80%;height:100px;background:#222;color:#1DB954;font-size:16px;padding:10px;border-radius:8px;">${tokenData.refresh_token || JSON.stringify(tokenData)}</textarea>
                </body>
                </html>
            `);
        }

        // Rota de Busca de Músicas
        if (req.method === 'GET' && req.query.action === 'search') {
            const accessToken = await getAccessToken();
            const query = req.query.q;
            if (!query) return res.status(400).json({ error: 'Termo de busca vazio' });

            const searchRes = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const searchData = await searchRes.json();
            return res.status(200).json(searchData);
        }

        // Rota para Adicionar à Fila
        if (req.method === 'POST') {
            const accessToken = await getAccessToken();
            const { uri } = req.body;
            if (!uri) return res.status(400).json({ error: 'URI da música ausente' });

            const queueRes = await fetch(`https://api.spotify.com/v1/me/player/queue?uri=${encodeURIComponent(uri)}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            if (queueRes.status === 204 || queueRes.ok) {
                return res.status(200).json({ success: true, message: 'Música adicionada à fila com sucesso!' });
            } else {
                const errData = await queueRes.json();
                return res.status(400).json({ error: 'Erro ao adicionar à fila. O Spotify precisa estar aberto no seu celular!', details: errData });
            }
        }

        return res.status(405).json({ error: 'Método não permitido' });

    } catch (error) {
        return res.status(500).json({ error: 'Erro interno no servidor', details: error.message });
    }
};