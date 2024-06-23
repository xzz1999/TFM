import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyCiJWaG5f0XYrJUZ0wyLfNzZQHwiZQShRQ");

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


async function chatWithModel() {
  const prompt = "resumenme este video https://www.youtube.com/watch?v=LtUh2a_EUu4"
  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  console.log(text);

}

chatWithModel();
