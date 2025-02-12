import { Handler } from '@netlify/functions';
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export const handler: Handler = async (event, context) => {
  const prompt = event.queryStringParameters?.prompt;
  console.log('prompt', prompt);
  if (!prompt) {
    return {
      statusCode: 400,
      body: 'Prompt is required',
    };
  }

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
      model: 'deepseek-chat',
    });

    const textResponse = completion.choices[0].message.content;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
      },
      body: JSON.stringify({ response: textResponse }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: `Error: ${(error as Error).message}`,
    };
  }
};
