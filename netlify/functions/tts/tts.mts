import { Context } from '@netlify/functions'
import { ElevenLabsClient } from "elevenlabs";
import { Readable } from 'stream';


export default async (request: Request, context: Context) => {
  try {
      const url = new URL(request.url)
      const message = url.searchParams.get('message') 
      if (!message) {
        return new Response('Text is required', {
          status: 500,
        })
      }
      const client = new ElevenLabsClient();
      
      const audioStream = await client.textToSpeech.convertAsStream('JBFqnCBsd6RMkjVDRZzb', {
        text: removeEmojis(message),
        model_id: 'eleven_multilingual_v2',
      });

      
      return new Response(audioStream as unknown as BodyInit, {
        headers: {
          "content-type": "audio/mpeg", 
        },
      });
   

    } catch (error) {
      return new Response((error as Error).toString(), {
        status: 500,
      })
    }
  }

function removeEmojis(text:string) {
    return text.replace(/[\u{1F600}-\u{1F64F}|\u{1F300}-\u{1F5FF}|\u{1F680}-\u{1F6FF}|\u{1F700}-\u{1F77F}|\u{1F780}-\u{1F7FF}|\u{1F800}-\u{1F8FF}|\u{1F900}-\u{1F9FF}|\u{1FA70}-\u{1FAFF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}|\u{FE0F}]/gu, "");
}
  