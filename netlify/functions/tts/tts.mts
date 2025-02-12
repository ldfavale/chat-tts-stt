import { Handler } from '@netlify/functions';
import { ElevenLabsClient } from 'elevenlabs';

const client = new ElevenLabsClient();

export const handler: Handler = async (event, context) => {
  try {
    const message = event.queryStringParameters?.message;
    console.log('message:', message);

    if (!message) {
      return {
        statusCode: 400,
        body: 'Text is required',
      };
    }

    const audioStream = await client.textToSpeech.convertAsStream('JBFqnCBsd6RMkjVDRZzb', {
      text: removeEmojis(message),
      model_id: 'eleven_multilingual_v2',
    });

    const headers = {
      'Content-Type': 'audio/mpeg',
      'Access-Control-Allow-Origin': '*', // Permite solicitudes desde cualquier origen
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
    };

    return {
      statusCode: 200,
      headers,
      body: audioStream as unknown as string, // Asegúrate de que el tipo sea compatible
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
