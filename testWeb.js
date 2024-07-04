const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const ngrok = require('ngrok');
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = '';
const bot = new TelegramBot(TOKEN);

const app = express();
app.use(bodyParser.json());

app.post('/', (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Hello, world!', { parse_mode: 'HTML' });
});

bot.on('message', (msg) => {
    if (msg.text && msg.text !== '/start') {
        sendMessageToReactBackend(msg.chat.id, msg.text);
        bot.sendMessage(msg.chat.id, msg.text, { parse_mode: 'HTML' });
    }
});

function sendMessageToReactBackend(chat_id, text) {
    const url = 'http://localhost:3002/api/telegramMessage'; // URL de tu backend
    const data = {
        chat_id: chat_id,
        text: text
    };
    axios.post(url, data)
        .then(response => console.log('Message sent to backend'))
        .catch(error => console.error('Error sending message to backend:', error));
}

(async function() {
    try {
        const url = await ngrok.connect({ addr: 5000, authtoken: '2iMlea7ZnNMJhdnO6dFaGdhQwBH_6WQ37YTYoGmyyiE2i6ir8', region: 'eu' });
        console.log('Webhook URL:', url);
        bot.setWebHook(`${url}/`);

        app.listen(5000, () => {
            console.log('Web server started on port 5000');
        });
    } catch (error) {
        console.error('Error starting ngrok:', error);
    }
})();
