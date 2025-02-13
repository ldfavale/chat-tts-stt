// tts.mts
import { HandlerEvent } from '@netlify/functions';
import { ElevenLabsClient } from 'elevenlabs';

const client = new ElevenLabsClient();

const DEV_BASE_URL = "http://localhost:8888";
const PROD_BASE_URL = "https://chat-tts-stt.netlify.app/";

const corsHeaders = {
  "Access-Control-Allow-Origin": DEV_BASE_URL ,
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
  try {
    const { message } = JSON.parse(event.body || "");

    if (!message) {
      return {
        statusCode: 400,
        body:  JSON.stringify({ response: "text is required" }),
      };
    }

    const audioStream = await client.textToSpeech.convertAsStream('JBFqnCBsd6RMkjVDRZzb', {
      text: removeEmojis(message),
      model_id: 'eleven_multilingual_v2',
    });

    const headers = {
      ...corsHeaders,
      'Content-Type': 'audio/mpeg'
    };

    return {
      statusCode: 200,
      headers,
      body: audioStream , 
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: `Error: ${(error as Error).message}`,
    };
  }
};

function removeEmojis(text: string): string {
  return text.replace(
    /[\u{1F600}-\u{1F64F}|\u{1F300}-\u{1F5FF}|\u{1F680}-\u{1F6FF}|\u{1F700}-\u{1F77F}|\u{1F780}-\u{1F7FF}|\u{1F800}-\u{1F8FF}|\u{1F900}-\u{1F9FF}|\u{1FA70}-\u{1FAFF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}|\u{FE0F}]/gu,
    ''
  );
}
