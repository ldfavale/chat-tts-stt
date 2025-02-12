import { Context } from '@netlify/functions'
import OpenAI from "openai";


const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export default async (request: Request, context: Context) => {
  const url = new URL(request.url)
  const prompt = url.searchParams.get('prompt') 
  console.log("prompt",prompt);
  if (!prompt) {
    return new Response('Prompt is required', {
      status: 500,
    }) 
  }
  try {
  
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", "content": prompt }
    ],
      model: "deepseek-chat",
    });

    const textResponse = completion.choices[0].message.content
    

    return new Response(textResponse, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // O especifica el origen permitido
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
      },
    });
  } catch (error) {
    return new Response((error as Error).toString(), {
      status: 500,
    })
  }
}
