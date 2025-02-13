import { HandlerEvent, stream } from "@netlify/functions";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:8888",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Origin",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

export const handler = async (event: HandlerEvent) => {
  // Manejar solicitud OPTIONS
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: "",
    };
  }

  // Validar parámetro
  const { prompt } = JSON.parse(event.body || "");
  if (!prompt) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Prompt is required" }),
    };
  }

  try {
    // Generar respuesta
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },
      ],
      model: "deepseek-chat",
    });

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(completion.choices[0].message.content),
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};