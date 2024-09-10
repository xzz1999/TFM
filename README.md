## versión Final de Sistema con integración de telegram, speechToTest, resumen de pdf, video y consultas multimodal.

## Servidor Guardrail AI.
Copiar el archivo testTopic de la rama withguard y sigue los mismos pasos indicados en esa sección.
## Servidor AI assistants.
1. Sustituya las claves api en el archivo .env 
2. Instalación de dependencias
```
npm install
```
3. ejecutar el servidor
```
npm run dev
```
4. ejecutar el servidor de pdt a texto
```
Python textPDF.js
```
### Servidor telegram bot.
ejecutar el servicio telegram
```
node botServer.js
```

