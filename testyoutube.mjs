import { YoutubeTranscript } from 'youtube-transcript';

// Función para obtener la transcripción de un video de YouTube
async function obtenerTranscripcion(videoId) {
    try {
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        const textosJuntos = transcript.map(segment => segment.text).join(' ');
        console.log(textosJuntos);
    } catch (error) {
        console.error('Error al obtener la transcripción:', error);
    }
}

// ID del video de YouTube
const videoId = 'https://www.youtube.com/watch?v=9U8EaVjuq6U';

// Llamar a la función para obtener la transcripción
obtenerTranscripcion(videoId);
