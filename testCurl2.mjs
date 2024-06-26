import fetch from 'node-fetch';

async function postData() {
  const response = await fetch('http://138.4.22.130:9090/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      "Authorization": "2adadadadas"
    },
    body: JSON.stringify({
      model: 'mistral7b',
      messages:  [
        {
          "role": "assistant",
          "content": "You are a helpful assistant."
        },
        {
          "role": "user",
          "content": "Hello!"
        }
      ],
    })
  });
  
  const data = await response.json();
  
  // Verificar si hay alguna opción de respuesta
  if (data.choices && data.choices.length > 0) {
    const message = data.choices[0].message;
    const assistantIndex = message.content.indexOf("assistant");
    if (assistantIndex !== -1) {
      const partialMessage = message.content.slice(0, assistantIndex);
      console.log("Mensaje devuelto:", partialMessage);
    } else {
      console.log("No se encontró la palabra 'assistant' en el mensaje.");
    }
  } else {
    console.log("No se encontró ningún mensaje en las opciones devueltas.");
  }
}

postData();
