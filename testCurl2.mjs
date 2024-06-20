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
          "content": "eres profesor de historia para alumnos de 2 de bachillerato."
        },
        {
          "role": "user",
          "content": "¿Quién fue el primer emperador romano?"
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
      console.log("Mensaje devuelto:",message );
    }
  } else {
    console.log("No se encontró ningún mensaje en las opciones devueltas.");
  }
}

postData();
