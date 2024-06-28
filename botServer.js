const express = require('express');
const bodyParser = require('body-parser');
const TeleBot = require('telebot');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const util = require('util');
const streamPipeline = util.promisify(require('stream').pipeline);

const app = express();
const port = 3003;
const OPENAI_API_KEY = "";


app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());


const bots = {};

// Ruta para crear un nuevo bot
app.post('/api/createbot', async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).send({ error: 'Token is required' });
    }

    if (bots[token]) {
        return res.status(400).send({ error: 'Bot already exists' });
    }

    const bot = new TeleBot(token);

    try {
        const botInfo = await bot.getMe();
        const botUsername = botInfo.username;

        bot.on('/start', (msg) => {
            bot.sendMessage(msg.chat.id, 'Hola! ¿En qué puedo ayudarte?');
        });

        bot.on('text', async (msg) => {
            const chatId = msg.chat.id;
            const text = msg.text;
            console.log('Mensaje recibido:', text);
            const username = msg.from.username || 'unknown_user';

            if (text === '/start' || text === '/youtube') {
                bot.sendMessage(chatId, 'Por favor, introduce el URL de YouTube:');
                return;
            }

            if (text.startsWith('http://') || text.startsWith('https://') || text.startsWith('/youtube http://') || text.startsWith('/youtube https://')) {
                bot.sendMessage(chatId, 'Procesando el URL de YouTube...');
                let url = text.startsWith('/youtube ') ? text.split(' ')[1] : text;

                try {
                    const response = await axios.post('http://localhost:3000/api/transcriptor', { url });
                    const transcription = response.data.text;
                    const prompt = "dame el resumen de este video: \n" + transcription + "\n";

                    const telegramResponse = await axios.post('http://localhost:3000/api/telegram', {
                        text: prompt,
                        token,
                        user: username
                    });

                    console.log('Mensaje enviado con éxito:', telegramResponse.data);
                    if (telegramResponse.data.text) {
                        bot.sendMessage(chatId, telegramResponse.data.text);
                    } else {
                        bot.sendMessage(chatId, 'No se pudo generar una respuesta.');
                    }
                } catch (error) {
                    console.error('Error al procesar el URL de YouTube:', error);
                    bot.sendMessage(chatId, 'Error al procesar tu mensaje. Por favor, intenta nuevamente.');
                }
            } else {
                try {
                    const response = await axios.post('http://localhost:3000/api/telegram', {
                        text,
                        token,
                        user: username
                    });

                    console.log('Mensaje enviado con éxito:', response.data);
                    if (response.data.text) {
                        bot.sendMessage(chatId, response.data.text);
                    } else {
                        bot.sendMessage(chatId, 'No se pudo generar una respuesta.');
                    }
                } catch (error) {
                    console.error('Error al enviar el mensaje:', error);
                    bot.sendMessage(chatId, 'Error al procesar tu mensaje. Por favor, intenta nuevamente.');
                }
            }
        });

        bot.on('photo', async (msg) => {
            const chatId = msg.chat.id;
            const fileId = msg.photo[msg.photo.length - 1].file_id;
            const text = msg.caption||"describeme la imagen";
            console.log("fileId", fileId);
            console.log("text", text);

            try {
                const response = await axios.post('http://localhost:3000/api/verifier', { token });
                if (response.data.status !== "success") {
                    bot.sendMessage(chatId, 'Error en procesar la imagen. Por favor, intenta nuevamente.');
                    return;
                }
                console.log("datos obtenidos",response.data.bot,response.data.key)
                const ai = response.data.bot;
                const key = response.data.key;
                const id = response.data.id;

                if (ai !== "gpt-4-1106-preview" && ai !== "gemini-1.0-pro") {
                    bot.sendMessage(chatId, 'Lo siento, no tienes capacidad para procesar la imagen.');
                    return;
                }
                try {
                    const fileResponse = await axios.get(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
                    const filePath = fileResponse.data.result.file_path;
                    const fileUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;
                    const fileName = path.basename(filePath);
                    const localFilePath = path.resolve(__dirname, fileName);
                    const fileStream = fs.createWriteStream(localFilePath);
                    const downloadResponse = await axios({ method: 'get', url: fileUrl, responseType: 'stream' });
                    await streamPipeline(downloadResponse.data, fileStream);

                    const fileBuffer = fs.readFileSync(localFilePath);
                    const image = "data:image/jpeg;base64," + fileBuffer.toString('base64');
                    if(ai == "gpt-4-1106-preview"){
                    const aiResponse = await axios.post('http://localhost:3000/api/openAI/MultiModal', {
                       token: key,
                       message: text,
                       image: image
                    });

                    if (aiResponse.data.status === "success") {
                        bot.sendMessage(chatId, aiResponse.data.response.message.content);
                    } else {
                        bot.sendMessage(chatId, 'Error en procesar la respuesta. Por favor, intenta nuevamente.');
                    }
                }
                if(ai == "gemini-1.0-pro"){
                    const aiResponse = await axios.post('http://localhost:3000/api/Gemini/multimodal', {
                          id: id,
                          message: text,
                          base64Image: image
                    });
                    if (aiResponse.data.result) {
                        bot.sendMessage(chatId, aiResponse.data.result);
                    } else {
                        bot.sendMessage(chatId, 'Error en procesar la respuesta. Por favor, intenta nuevamente.');
                    }
                }
                    fs.unlinkSync(localFilePath);
                } catch (error) {
                    console.error("Error enviando la imagen:", error.response ? error.response.data : error.message);
                    bot.sendMessage(chatId, 'Error en el procesamiento de la imagen. Por favor, intenta nuevamente.');
                }
            } catch (error) {
                console.error('Error en verificar el token:', error);
                bot.sendMessage(chatId, 'Error en verificar el token. Por favor, intenta nuevamente.');
            }
        });
        bot.on("document", async (msg) => {
            const fileId = msg.document.file_id;

            // Verifica si el archivo es un PDF
            if (msg.document.mime_type === "application/pdf") {
                // Obtén la URL del archivo
                const file = await bot.getFile(fileId);
                const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;
        
                // Descarga el archivo PDF
                const response = await axios.get(fileUrl, { responseType: 'stream' });
                const filePath = path.join(__dirname, `${fileId}.pdf`);
                const writer = fs.createWriteStream(filePath);
        
                response.data.pipe(writer);
        
                writer.on('finish', async () => {
                    // Envía el archivo a localhost:3001/api/text/upload
                    const formData = new FormData();
                    formData.append('pdf', fs.createReadStream(filePath)); 
                    console.log("extrayendo texto de pdf")
        
                    try {
                        const uploadResponse = await axios.post('http://localhost:3001/api/text/upload', formData, {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                                ...formData.getHeaders(),
                            },
                        });
                        if(uploadResponse.data.sucess ===true){
                            const aiResponse  = await axios.post('http://localhost:3000/api/Gemini/sumaryPDF', {
                                text: uploadResponse.data.text,
                            });
                            if(aiResponse.data.status ==="sucess"){
                                bot.sendMessage(msg.chat.id, aiResponse.data.message);
                            }else{
                                bot.sendMessage(msg.chat.id, 'Error en procesar el pdf. Por favor, intenta nuevamente.');
                            }
                        }else{
                            bot.sendMessage(msg.chat.id, 'Error en procesar el pdf. Por favor, intenta nuevamente.');
                        }


                    } catch (error) {
                        bot.sendMessage(msg.chat.id, 'Hubo un error al enviar el archivo al servidor.');
                    } finally {
                        // Elimina el archivo temporal
                        fs.unlinkSync(filePath);
                    }
                });
        
                writer.on('error', () => {
                    bot.sendMessage(msg.chat.id, 'Hubo un error al descargar el archivo.');
                });
            } else {
                bot.sendMessage(msg.chat.id, "Por favor, envíame un archivo PDF.");
            }
        });


        bot.on('voice', async (msg) => {
            const chatId = msg.chat.id;
            const fileId = msg.voice.file_id;
            console.log("fileId", fileId);

            try {
                const file = await bot.getFile(fileId);
                const filePath = `./audio/${fileId}.oga`;
                const fileUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`;

                const writer = fs.createWriteStream(filePath);
                const response = await axios({
                    url: fileUrl,
                    method: 'GET',
                    responseType: 'stream'
                });

                response.data.pipe(writer);

                writer.on('finish', async () => {
                    console.log('Archivo de audio descargado con éxito:', filePath);
                    const formData = new FormData();
                    formData.append('file', fs.createReadStream(filePath));
                    formData.append('model', 'whisper-1');

                    const headers = {
                        'Authorization': `Bearer ${OPENAI_API_KEY}`,
                        ...formData.getHeaders()
                    };

                    try {
                        const whisperResponse = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, { headers });
                        const transcription = whisperResponse.data.text;

                        const telegramResponse = await axios.post('http://localhost:3000/api/telegram', {
                            text: transcription,
                            token,
                            user: msg.from.username || 'unknown_user'
                        });

                        if (telegramResponse.data.text) {
                            bot.sendMessage(chatId, telegramResponse.data.text);
                        } else {
                            bot.sendMessage(chatId, 'No se pudo generar una respuesta.');
                        }
                    } catch (whisperError) {
                        console.error('Error al transcribir el audio:', whisperError);
                        bot.sendMessage(chatId, 'Error al transcribir el audio. Por favor, intenta nuevamente.');
                    }

                    fs.unlinkSync(filePath);
                });

                writer.on('error', (err) => {
                    console.error('Error al descargar el archivo de audio:', err);
                    bot.sendMessage(chatId, 'Error al procesar el archivo de audio. Por favor, intenta nuevamente.');
                });
            } catch (error) {
                console.error('Error al manejar el archivo de voz:', error);
                bot.sendMessage(chatId, 'Error al manejar el archivo de voz. Por favor, intenta nuevamente.');
            }
        });

        bot.start();
        bots[token] = bot;

        res.send({ status: 'success' });
    } catch (error) {
        console.error('Error al obtener información del bot:', error);
        res.status(500).send({ error: 'Failed to get bot information' });
    }
});

// Ruta para recibir mensajes desde los bots
app.post('/api/telegramMessage', (req, res) => {
    const { text, chatId, messageId, from } = req.body;

    // Aquí puedes manejar el mensaje recibido según tus necesidades
    console.log('Mensaje recibido:', { text, chatId, messageId, from });

    res.send({ success: true, text: `Recibido: ${text}` });
});

// Ruta para eliminar un bot
app.post('/api/deleteBot', (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).send({ error: 'Token is required' });
    }

    const bot = bots[token];
    if (!bot) {
        return res.status(404).send({ error: 'Bot not found' });
    }

    bot.stop();
    delete bots[token];
    res.send({ status: 'success' });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// Manejo de errores global para promesas no manejadas
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});
