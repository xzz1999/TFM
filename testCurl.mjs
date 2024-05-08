import fetch from 'node-fetch';

async function postData() {
  const response = await fetch('http://127.0.0.1:11434/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      model: 'a8f8ebd3-3f3f-4aab-b43e-5e2e94b4074b',
      messages: [{ "role": "user", "content": "cuanto es 1 + 1" }],
      stream: false
    })
  });

  const data = await response.json();
  console.log(data);
}

postData();
