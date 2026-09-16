<div align="center">
  <img src="public/imgs/logo_Music-Car-dark.png" alt="Logo DJ da Viagem" width="250">

  # 🎧 DJ da Viagem (Music-Car) 🚗💨
  
  *Sua viagem, sua trilha sonora!*
</div>

<br>

Um Web App leve e interativo desenvolvido para motoristas de aplicativo (Uber/99) oferecerem uma experiência premium aos seus passageiros. Através de um QR Code, o passageiro acessa o sistema, busca suas músicas favoritas e as envia diretamente para a fila do Spotify do carro.

## ✨ Funcionalidades

* **Busca Integrada:** Pesquisa em tempo real no catálogo do Spotify.
* **Fila Automática:** Adiciona a música escolhida diretamente à fila de reprodução do motorista (`/v1/me/player/queue`).
* **Controle de Limites:** Restrição inteligente de 2 músicas por passageiro/corrida, controlada via `localStorage` diretamente no navegador do usuário.
* **Design Responsivo e Temático:** Interface em "Dark Mode" projetada para uso rápido e fácil em smartphones durante a viagem.
* **Segurança Vercel:** Uso de Serverless Functions (Backend) para ocultar e proteger as chaves de API e tokens do Spotify.

## 🛠️ Tecnologias Utilizadas

* **Front-end:** HTML5, CSS3, Vanilla JavaScript.
* **Back-end:** Vercel Serverless Functions (Node.js).
* **API:** Spotify Web API.
* **Hospedagem:** Vercel.

## 🚀 Como Funciona na Prática

1. O passageiro escaneia um QR Code no banco de trás do carro.
2. A página "DJ da Viagem" abre no navegador do celular do passageiro.
3. O passageiro digita o nome de uma música/artista, os resultados aparecem na tela, e ele clica na música desejada.
4. A aplicação envia um comando via API para a Vercel, que se autentica no Spotify do motorista e joga a música na fila.
5. O limite é atingido após 2 envios, bloqueando novas adições para aquela sessão.

## ⚙️ Configuração e Deploy

Para rodar este projeto, você precisará de uma conta no [Spotify for Developers](https://developer.spotify.com/) e uma conta na [Vercel](https://vercel.com/).

### 1. Configurando o Spotify
* Crie um App no painel do Spotify Developer.
* Vá em **Settings** -> **Users and Access** e adicione o e-mail da conta do Spotify que tocará as músicas no carro (Obrigatório se o app estiver em modo *Development*).
* Guarde o `Client ID` e o `Client Secret`.
* Gere um `Refresh Token` com os escopos `user-modify-playback-state` e `user-read-playback-state`.

### 2. Deploy na Vercel
* Conecte este repositório do GitHub à Vercel.
* Antes do deploy, configure as seguintes **Environment Variables** (em modo *All Environments*):
  * `SPOTIFY_CLIENT_ID`: Seu Client ID do Spotify.
  * `SPOTIFY_CLIENT_SECRET`: Seu Client Secret do Spotify.
  * `SPOTIFY_REFRESH_TOKEN`: Seu Refresh Token gerado.

### 3. Estrutura de Pastas Exigida
Para que o deploy funcione corretamente na Vercel, a estrutura deve ser:

```text
/
├── api/
│   └── proxy.js         # Backend Serverless da Vercel
├── public/
│   ├── index.html       # Interface do Web App
│   └── imgs/            # Pasta com a logo e o favicon
├── package.json         # Dependências (node-fetch)
├── README.md            # Este arquivo
└── LICENSE              # Licença do projeto
```

## ⚠️ Requisito Importante para Uso
Para que a API do Spotify aceite adicionar músicas na fila, **o Spotify do motorista precisa estar ativo**. Ou seja, o aplicativo deve estar aberto e ter reproduzido algo recentemente no dispositivo de áudio do carro para que a sessão seja reconhecida pela API.

---

## ☕ Apoie este Projeto

Se esta ferramenta foi útil para você ou melhorou a experiência das suas corridas, considere fazer uma doação para apoiar o desenvolvimento e a manutenção dos projetos do **Informático Floripa**. 

🔑 **Chave PIX (Celular):**  
`48988310764`

*Toda contribuição ajuda a manter a ferramenta no ar e a trazer novas funcionalidades!*