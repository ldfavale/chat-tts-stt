// tts.mts
import { HandlerEvent } from '@netlify/functions';
import { ElevenLabsClient } from 'elevenlabs';
import { FRONTEND_URL } from '../../../constants.js'

const client = new ElevenLabsClient();

const corsHeaders = {
  "Access-Control-Allow-Origin": FRONTEND_URL ,
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
    console.log("event",event)
    const { message } = JSON.parse(event.body || "");
    
    if (!message || typeof message !== "string") {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Invalid message format" }),
      };
    }
    // const audioStream = await client.textToSpeech.convertAsStream('JBFqnCBsd6RMkjVDRZzb', {
    //   text: removeEmojis(message),
    //   model_id: 'eleven_multilingual_v2',
    // });
    // console.log("audioStream",audioStream)
    
    const audioBuffer = await client.textToSpeech.convert("JBFqnCBsd6RMkjVDRZzb", {
      text: removeEmojis(message),
      model_id: "eleven_multilingual_v2",
      output_format: "mp3_44100_128",
    });
    

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
      },
      body: audioBuffer,
      isBase64Encoded: true,
    };
  } catch (error) {
    console.log("ERROR:",error)
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
