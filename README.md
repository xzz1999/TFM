## Versión 2.0 Con la integración de Guardrail AI


## Getting Started

## Servidor Guardrail

1. Crear un nuevo directorio y copia el archivo testTopic.py en el directorio creado.

2. Una vez creado el directorio crear un entorno virtual:
```
python -m venv myenv

source venv/bin/activate
```
3. instalación de dependencias:
```
pip install flask
pip install guardrails-ai;
guardrails configure;
guardrails hub install hub://tryolabs/restricttotopic
```
4. Una vez terminado instalado las dependencias,modifique la clave api deopenai en el archivo testTopic.py

5. Por lo último despliega el servidor guardrail utilizando el comando:
```
python .\testTopic.py 
```  
## Servidor AI Assistants
1. instalación de dependencias:
```
npm install
```
2. desplegar el servidor
```
npm run dev
```

