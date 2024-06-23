import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("");

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


async function chatWithModel() {
  const chat =  model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: "Pretend you're a snowman and stay in character for each response." }],
      },
      {
        role: "model",
        parts: [{ text: "Hello! It's cold! Isn't that great?" }],
      },
    ],
    generationConfig: {
      maxOutputTokens: 100,
    },
  });
  const msg = "What's your favorite season of the year?";
  const result = await chat.sendMessage(msg);
  console.log(result.text);
}

chatWithModel();
