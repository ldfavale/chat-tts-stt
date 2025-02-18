import { HandlerEvent, stream } from "@netlify/functions";
import OpenAI from "openai";
import { FRONTEND_URL } from '../../../constants.js'

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

const corsHeaders = {
  "Access-Control-Allow-Origin": FRONTEND_URL,
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
  const { messages } = JSON.parse(event.body || "");
  if (!messages) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Prompt is required" }),
    };
  }

  try {
    // Generar respuesta
    const completion = await openai.chat.completions.create({
        messages,
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
    console.error(error)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Internal Server Error", err: error }),
    };
  }
};