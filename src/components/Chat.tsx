import { PauseIcon, PlayIcon } from "@heroicons/react/20/solid";
import { useState, useRef, useEffect } from "react";

interface Message {
    text: string;
    role: "user" | "system";
  }

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState(""); 
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  
  const handleSendMessage = async () => {
    if (!inputText.trim()) return; 

    setMessages((prevMessages) => [
      ...prevMessages,
      { text: inputText, role: "user" },
    ]);

    setIsLoading(true);
    setInputText("");

    try {
        const chatResponse = await handleSendPrompt();
        const audioResponse = await fetchTTS(chatResponse)
        const audioBlob = await audioResponse.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        if(audioRef && audioRef.current ){
          audioRef.current.src = audioUrl;
          audioRef.current.play();
          setIsPlaying(true)
        }

        setMessages((prevMessages) => [
            ...prevMessages, 
            { text: chatResponse, role: "system" },
        ]);

    } catch (error) {
        console.error("Error:", error);
        setMessages((prevMessages) => [
            ...prevMessages,
            { text: "Error al obtener la respuesta", role: "system" },
          ]);
    }finally{
        setIsLoading(false);
    }
  };

  const handleSendPrompt = async () => {
    try {
      const chatResponse = await fetchChatGPT(inputText);
      return chatResponse;
    } catch (error) {
      console.error("Error fetching response:", error);
    }
  };

  const fetchChatGPT = async (prompt: string) => {
    const res = await fetch("https://chat-tts-stt.netlify.app/.netlify/functions/deepseek", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: prompt ,
    });
    const data = await res.json();
    return data;
  };

  const fetchTTS = async (message: string) => {
    return await fetch("https://chat-tts-stt.netlify.app/.netlify/functions/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: message ,
    });    
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }else{
      audioRef.current.play();
      setIsPlaying(true);
    }
  }
  

  return (
    <div className=" flex flex-col h-screen p-4 box-border bg-slate-800 "
    >
      {/* Área de chat */}
      <div
        ref={chatContainerRef}
       
        className="  flex flex-col-reverse overflow-y-auto mb-4 flex-1 "
      >
        {messages
          .slice() // Crear una copia del array para no modificar el original
          .reverse() // Invertir el orden para mostrar los mensajes más recientes abajo
          .map((message, index) => (
            <div
              key={index}
              style={{
                alignSelf: message?.role === "user" ? "flex-end" : "flex-start",
                backgroundColor: message?.role === "user" ? "#007baa" : "#f1f1f1",
                color: message?.role === "user" ? "#fff" : "#000",
                padding: "8px 12px",
                borderRadius: "8px",
                marginBottom: "8px",
                maxWidth: "70%",
              }}
              className="text-white"
            >
              {message?.text}
            </div>
          ))}
      </div>

      {isLoading && (
          <div
            style={{
              alignSelf: "flex-start",
              marginBottom: "8px",
            }}
          >
            <img
              src="https://i.gifer.com/ZZ5H.gif"
              alt="Loading..."
              className={"w-10 h-10 p-2"}
            />
          </div>
        )}

      {/* Entrada de texto */}
      <div
        style={{
          display: "flex",
          gap: "8px",
        }}
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "8px",
            
          }}
          className="bg-slate-500 text-white placeholder:text-white"
          placeholder="Escribe un mensaje..."
        />
        <button
          onClick={handleSendMessage}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#007baa",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Enviar
        </button>
        <audio id="audioPlayer" ref={audioRef} ></audio>
       <button onClick={() => handlePlayPause()} className="p-4  bg-slate-400 rounded-full" >
       { isPlaying ? 
            <PauseIcon className="h-6 w-6 text-white" /> :
            <PlayIcon className="h-6 w-6 text-white" />
      }
       </button>
      </div>
    </div>
  );
};

export default Chat;