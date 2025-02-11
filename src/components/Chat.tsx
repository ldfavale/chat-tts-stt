import { PauseIcon, PlayIcon } from "@heroicons/react/20/solid";
import { useState, useRef, useEffect } from "react";

const Chat = () => {
  const [messages, setMessages] = useState([]); // Almacena los mensajes
  const [inputText, setInputText] = useState(""); // Almacena el texto del input
  const chatContainerRef = useRef(null); // Referencia al contenedor del chat
  const audioElement = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Efecto para hacer scroll automático al final del chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Función para manejar el envío de mensajes
  const handleSendMessage = async () => {
    if (!inputText.trim()) return; // Evitar mensajes vacíos

    // Agregar el mensaje del usuario al chat
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: inputText, role: "user" },
    ]);

    setIsLoading(true);
    // Limpiar el input
    setInputText("");
    try {
        const chatResponse = await handleSendPrompt();
        setMessages((prevMessages) => [
            ...prevMessages.filter((msg) => msg.text !== "Procesando..."), // Eliminar el mensaje de "Procesando..."
            { text: chatResponse, role: "system" },
            ]);
    } catch (error) {
        console.error("Error:", error);
        setMessages((prevMessages) => [
            ...prevMessages,
            { text: "Error al obtener la respuesta", sender: "bot" },
          ]);
    }finally{
        setIsLoading(false);
    }

    
   
   
   
  };


  

  const handleSendPrompt = async () => {
    try {
      const chatResponse = await fetchChatGPT(inputText);
      const audio = await fetchTTS(chatResponse);
      return chatResponse;
    } catch (error) {
      console.error("Error fetching response:", error);
    }
  };

  const fetchChatGPT = async (prompt) => {
    const res = await fetch("http://localhost:3001/api/chatgpt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    return data;
  };
  const fetchTTS = async (message) => {
    const response = await fetch("http://localhost:3001/api/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });
    
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    if(audioElement && audioElement.current ){
      audioElement.current.src = audioUrl;
      audioElement.current.play();
      setIsPlaying(true)
    }
    
  };

  const handlePlayPause = () => {
    if (!audioElement.current) return;

    if (isPlaying) {
      audioElement.current.pause();
      setIsPlaying(false);
    }else{
      audioElement.current.play();
      setIsPlaying(true);

    }
  }
  

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        padding: "16px",
        boxSizing: "border-box",
      }}
    >
      {/* Área de chat */}
      <div
        ref={chatContainerRef}
        style={{
          flex: 1,
          overflowY: "auto",
          marginBottom: "16px",
          display: "flex",
          flexDirection: "column-reverse", // Mostrar los mensajes más recientes arriba
        }}
      >
        {messages
          .slice() // Crear una copia del array para no modificar el original
          .reverse() // Invertir el orden para mostrar los mensajes más recientes arriba
          .map((message, index) => (
            <div
              key={index}
              style={{
                alignSelf: message?.role === "user" ? "flex-end" : "flex-start",
                backgroundColor: message?.role === "user" ? "#007bff" : "#f1f1f1",
                color: message?.role === "user" ? "#fff" : "#000",
                padding: "8px 12px",
                borderRadius: "8px",
                marginBottom: "8px",
                maxWidth: "70%",
              }}
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
              src="https://i.gifer.com/ZZ5H.gif" // URL de un gif de carga
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
            border: "1px solid #ccc",
          }}
          placeholder="Escribe un mensaje..."
        />
        <button
          onClick={handleSendMessage}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#007bff",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Enviar
        </button>
        <audio id="audioPlayer" ref={audioElement} ></audio>
       <button onClick={() => handlePlayPause()} className="p-4  bg-blue-400 rounded-full" >
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