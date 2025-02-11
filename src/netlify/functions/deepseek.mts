// backend/server.js
import express from 'express';
import  serverless from 'serverless-http"';
import dotenv from 'dotenv';
import OpenAI from "openai";
import cors from 'cors';
import fs from "fs";
import multer from 'multer';
import { ElevenLabsClient, play } from "elevenlabs";
import { Readable } from 'stream';

// Load environment variables
dotenv.config();

const app = express();
const port = 3001;
// const upload = multer({ dest: 'uploads/' });

// Middleware for CORS
app.use(cors({
  origin: 'https://chat-tts-stt.netlify.app/', // Allow requests from your frontend
}));

// Initialize OpenAI
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
});



// Route for interacting with ChatGPT
app.post('/deepseek', express.json(), async (req, res) => {
  const { prompt } = req.body;
  console.log("Body",req.body)

  if (!prompt) {
    return res.status(400).send({ error: 'Prompt is required' });
  }

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", "content": prompt }
    ],
      model: "deepseek-chat",
    });
    console.log(completion.choices[0].message);
    const textResponse = completion.choices[0].message.content
    res.json(textResponse);
    
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Error communicating with ChatGPT API' });
  }
  
});

function removeEmojis(text:string) {
  return text.replace(/[\u{1F600}-\u{1F64F}|\u{1F300}-\u{1F5FF}|\u{1F680}-\u{1F6FF}|\u{1F700}-\u{1F77F}|\u{1F780}-\u{1F7FF}|\u{1F800}-\u{1F8FF}|\u{1F900}-\u{1F9FF}|\u{1FA70}-\u{1FAFF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}|\u{FE0F}]/gu, "");
}

app.post('/tts', express.json(), async (req, res) => {
  const { message } = req.body;
  console.log("body", req.body)

  if (!message) {
    return res.status(400).send({ error: 'Text is required' });
  }

  try {
    const client = new ElevenLabsClient();

    const audioStream = await client.textToSpeech.convertAsStream('JBFqnCBsd6RMkjVDRZzb', {
      text: removeEmojis(message),
      model_id: 'eleven_multilingual_v2',
    });

    const nodeStream = Readable.from(audioStream);
    res.setHeader('Content-Type', 'audio/mpeg');
    nodeStream.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Error communicating with ElevenLabs API' });
  }
  
});

// const client = new ElevenLabsClient();
//       const audio = await client.textToSpeech.convert("JBFqnCBsd6RMkjVDRZzb", {
//         text: chatResponse,
//         model_id: "eleven_multilingual_v2",
//         output_format: "mp3_44100_128",
//       });
//       console.log(audio)
//       await play(audio);




// Route for Whisper (file upload and transcription)
// app.post('/api/whisper', upload.single('audio'), async (req, res) => {
//   try {
//     console.log("req.file",req.file)
//     console.log("req.path",req.file.path)
//     const audioFilePath = req.file.path;
//     const transcription = await openai.audio.transcriptions.create({
//       file: fs.createReadStream(audioFilePath),
//       model: "whisper-1",
//     });

//     console.log(transcription.text);
//     res.json({ transcription: transcription.text });
//   } catch (error) {
//     console.log("Error:", error)
//     console.error(error.response?.data || error.message);
//     res.status(500).json({ error: 'Error transcribing the audio' });
//   }
// });



// const PORT = process.env.PORT || port;

// app.listen(PORT, () => {
//   console.log(`Servidor corriendo en http://localhost:${PORT}`);
// });


module.exports.handler = serverless(app);
