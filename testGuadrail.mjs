import fetch from 'node-fetch';

async function postData() {
  const response = await fetch('http://127.0.0.1:5000/validate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text:"me gusta jugar eminem",
      valid_topics:["deporte"],
      invalid_topics: ["musica"]
    })
  });
  
  const data = await response.json();
  console.log("data:", data)
  
}

postData();
