// AudioRecorder.tsx
import { useState } from "react";

const AudioRecorder = ({ onAudioSubmit }: { onAudioSubmit: (audioBlob: Blob) => void }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const audioChunks: Blob[] = [];

    recorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    recorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      onAudioSubmit(audioBlob); // Enviar el audio al backend para la transcripción
    };

    recorder.start();
    setMediaRecorder(recorder);
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
    setIsRecording(false);
  };

  return (
    <div className="p-4">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`px-4 py-2 rounded ${isRecording ? "bg-red-500" : "bg-blue-500"} text-white`}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
    </div>
  );
};

export default AudioRecorder;
