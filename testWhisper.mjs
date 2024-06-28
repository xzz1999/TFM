import whisper from 'whisper-node';
const transcript = await whisper("C:\ejemplo.m4a");

console.log(transcript); 