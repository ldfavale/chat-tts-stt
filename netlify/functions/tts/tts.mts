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
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  try {
    const { message } = JSON.parse(event.body || "");
    
    // Generar stream de audio usando la API de ElevenLabs
    const audioStream = await client.textToSpeech.convertAsStream("JBFqnCBsd6RMkjVDRZzb", {
      text: removeEmojis(message),
      model_id: "eleven_multilingual_v2",
      output_format: "mp3_44100_128",
    });


    // 2. Convertir stream a Buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(chunks);

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
      },
      body: audioBuffer.toString("base64"),
      isBase64Encoded: true, // ¡Clave para Lambda!
    };

  } catch (error) {
    console.error("ERROR:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Error interno" }),
    };
  }

};

function removeEmojis(text: string): string {
  return text.replace(
    /[\u{1F600}-\u{1F64F}|\u{1F300}-\u{1F5FF}|\u{1F680}-\u{1F6FF}|\u{1F700}-\u{1F77F}|\u{1F780}-\u{1F7FF}|\u{1F800}-\u{1F8FF}|\u{1F900}-\u{1F9FF}|\u{1FA70}-\u{1FAFF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}|\u{FE0F}]/gu,
    ''
  );
}
