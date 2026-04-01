// import { useEffect, useRef, useState } from "react";
// import ChatbotIcon from "./components/ChatbotIcon";
// import ChatForm from "./components/ChatForm";
// import ChatMessage from "./components/ChatMessage";

// const App = () => {
//   const [chatHistory, setChatHistory] = useState([]);
//   const [showChatbot, setShowChatbot] = useState([false]);
//   const chatBodyRef = useRef();

//   const generateBotResponse = async (history) => {
//     const updateHistory = (text, isError = false) => {
//       setChatHistory((prev) => [
//         ...prev.filter((msg) => msg.text !== "Thinking..."),
//         { role: "model", text, isError },
//       ]);
//     };
//     history = history.map(({ role, text }) => ({ role, parts: [{ text }] }));
//     const requestOptions = {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ contents: history }),
//     };

//     try {
//       const response = await fetch(
//         import.meta.env.VITE_API_URL,
//         requestOptions
//       );
//       // const data = await response.json();
//       const text = await response.text();
//       console.log(text);
//       if (!response.ok)
//         throw new Error(data.error.message || "Something went wrong");
//       const apiReponseText = data.candidates[0].content.parts[0].text
//         .replace(/\*\*(.*?)\*\*/g, "$1")
//         .trim();
//       updateHistory(apiReponseText);
//     } catch (error) {
//       updateHistory(error.message, true);
//     }
//   };

//   useEffect(() => {
//     chatBodyRef.current.scrollTo({
//       top: chatBodyRef.current.scrollHeight,
//       behavior: "smooth",
//     });
//   }, [chatHistory]);

//   return (
//     <div className={`container ${showChatbot ? "show-chatbot" : ""}`}>
//       <button onClick={() => setShowChatbot(prev => !prev)} id="chatbot-toggler">
//         <span className="material-symbols-rounded">mode_comment</span>
//         <span className="material-symbols-rounded">close</span>
//       </button>
//       <div className="chatbot-popup">
//         {/* chat header */}
//         <div className="chat-header">
//           <div className="header-info">
//             <ChatbotIcon />
//             <h2 className="logo-text">Chatbot</h2>
//           </div>
//           <button onClick={() => setShowChatbot(prev => !prev)} className="material-symbols-rounded">
//             keyboard_arrow_down
//           </button>
//         </div>
//         {/* chat body */}
//         <div ref={chatBodyRef} className="chat-body">
//           <div className="message bot-message">
//             <ChatbotIcon />
//             <p className="message-text">
//               Chào bạn 👋 <br /> Tôi có thể giúp gì cho bạn hôm nay?
//             </p>
//           </div>

//           {chatHistory.map((chat, index) => (
//             <ChatMessage key={index} chat={chat} />
//           ))}
//         </div>
//         {/* chat footer */}
//         <div className="chat-footer">
//           <ChatForm
//             chatHistory={chatHistory}
//             setChatHistory={setChatHistory}
//             generateBotResponse={generateBotResponse}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default App;

import { useEffect, useRef, useState } from "react";
import ChatbotIcon from "./components/ChatbotIcon";
import ChatForm from "./components/ChatForm";
import ChatMessage from "./components/ChatMessage";

const App = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [showChatbot, setShowChatbot] = useState(false); // ✅ fix bug
  const chatBodyRef = useRef();

  const generateBotResponse = async (history) => {
    const updateHistory = (text, isError = false) => {
      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "Thinking..."),
        { role: "model", text, isError },
      ]);
    };

    // ✅ convert sang format của Groq (OpenAI style)
    const messages = history.map(({ role, text }) => ({
      role: role === "model" ? "assistant" : "user",
      content: text,
    }));

    try {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: "llama3-70b-8192",
            messages: messages,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Something went wrong");
      }

      // ✅ lấy text đúng format Groq
      const apiResponseText = data.choices[0].message.content
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .trim();

      updateHistory(apiResponseText);
    } catch (error) {
      updateHistory(error.message, true);
    }
  };

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatHistory]);

  return (
    <div className={`container ${showChatbot ? "show-chatbot" : ""}`}>
      <button
        onClick={() => setShowChatbot((prev) => !prev)}
        id="chatbot-toggler"
      >
        <span className="material-symbols-rounded">mode_comment</span>
        <span className="material-symbols-rounded">close</span>
      </button>

      <div className="chatbot-popup">
        {/* header */}
        <div className="chat-header">
          <div className="header-info">
            <ChatbotIcon />
            <h2 className="logo-text">Chatbot</h2>
          </div>
          <button
            onClick={() => setShowChatbot((prev) => !prev)}
            className="material-symbols-rounded"
          >
            keyboard_arrow_down
          </button>
        </div>

        {/* body */}
        <div ref={chatBodyRef} className="chat-body">
          <div className="message bot-message">
            <ChatbotIcon />
            <p className="message-text">
              Chào bạn 👋 <br /> Tôi có thể giúp gì cho bạn hôm nay?
            </p>
          </div>

          {chatHistory.map((chat, index) => (
            <ChatMessage key={index} chat={chat} />
          ))}
        </div>

        {/* footer */}
        <div className="chat-footer">
          <ChatForm
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            generateBotResponse={generateBotResponse}
          />
        </div>
      </div>
    </div>
  );
};

export default App;