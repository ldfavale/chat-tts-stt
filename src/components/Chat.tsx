import { PauseIcon, PlayIcon } from "@heroicons/react/20/solid";
import { useState, useRef, useEffect } from "react";
import { DEEPSEEK_URL, ELEVENLABS_TTS_URL} from '../../constants.js'
interface Message {
    text: string;
    role: "user" | "system";
  }

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState(""); 
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);

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
        const audioUrl = await fetchTTS(chatResponse);
    
        if (audioRef?.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play();
          setIsPlaying(true);
        }

      // if (currentAudioUrl) URL.revokeObjectURL(currentAudioUrl);
      // const newAudioUrl = URL.createObjectURL(audioBlob);
      // setCurrentAudioUrl(newAudioUrl);
      
      // console.log("audioUrl =>",newAudioUrl)

      // if (audioRef?.current) {
      //   audioRef.current.src = newAudioUrl;
      //   //audioRef.current.type = "audio/mpeg"; // Especificar formato
      //   await audioRef.current.play();
      //   setIsPlaying(true);
        
      //   // Limpieza automática
      //   audioRef.current.onended = () => {
      //     setIsPlaying(false);
      //     URL.revokeObjectURL(newAudioUrl);
      //     setCurrentAudioUrl(null);
      //   };
      // }

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
    const res = await fetch(DEEPSEEK_URL, {
      method: "POST",
      mode: 'cors',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    return data;
  };

  // const fetchTTS = async (message: string) => {
  //   console.log("message",message)
  //   console.log("JSON.stringify({ message })",JSON.stringify({ message }))
  //   return await fetch(ELEVENLABS_TTS_URL, {
  //     method: "POST",
  //     mode: 'cors',
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({ message }),
  //   });    
  // };
  const fetchTTS = async (message: string) => {
    const response = await fetch(ELEVENLABS_TTS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
  
    if (!response.ok) throw new Error("Error en TTS");
    
    // Crear MediaSource para streaming
    const mediaSource = new MediaSource();
    const audioUrl = URL.createObjectURL(mediaSource);
  
    mediaSource.addEventListener('sourceopen', async () => {
      const sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');
      
      const reader = response.body?.getReader();
      
      const pushChunk = async () => {
        const { done, value } = await reader!.read();
        if (done) {
          mediaSource.endOfStream();
          return;
        }
        
        if (!sourceBuffer.updating) {
          sourceBuffer.appendBuffer(value);
          await new Promise(resolve => 
            sourceBuffer.addEventListener('updateend', resolve, { once: true })
          );
          pushChunk();
        }
      };
      
      pushChunk();
    });
  
    return audioUrl;
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
    <div className=" flex flex-col h-screen p-4 box-border  w-full max-w-[1024px] "
    >
      {/* Área de chat */}
      <div
        ref={chatContainerRef}
       
        className="  flex flex-col-reverse overflow-y-auto mb-4 flex-1  "
      >
        {messages
          .slice() // Crear una copia del array para no modificar el original
          .reverse() // Invertir el orden para mostrar los mensajes más recientes abajo
          .map((message, index) => (
            <div
              key={index}
              style={{
                alignSelf: message?.role === "user" ? "flex-end" : "flex-start",
                backgroundColor: message?.role === "user" ? "#2578B0" : "#90A1B9",
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
        className="bg-slate-500 p-6 rounded-2xl gap-2 flex "
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyUp={(e) => e.key === "Enter" && handleSendMessage()}
         
          className=" text-white placeholder:text-white p-2 flex-1 border-none  focus-visible:outline-0"
          placeholder="Escribe un mensaje..."
        />
        
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