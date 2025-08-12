import axios from "axios";
import { useState } from "react";

const TextAi = () => {
  const [prompt, setPrompt] = useState("");
  const [message, setmessage] = useState([]);

  // const scrollToBottom = () => {
  //     messagesEndRef.current?.scrollIntoView({behavior : 'smooth'})
  // }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setmessage([...message, { role: "user", text: prompt }]);
    setPrompt("");

    try {
      const res = await axios.post("http://localhost:5000/ai/askai", {
        prompt,
      });
      setmessage((prev) => [...prev, { role: "ai", text: res.data }]);
    } catch (error) {
      console.log({ message: "something is worng" });
    }
  };

  return (
    <>
      <div className="bg-gray-100 p-4 h-screen">
        {/* chat message area */}

        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md h-96 overflow-y-auto">
          {message.map((msg, index) => (
            <div
              key={index}
              className={` ${msg.role === "user" ? "user" : "ai"}`}
            
            >
              {msg.text}
            </div>
          ))}
        </div>

        {/* input form */}

        <form
          className="flex justify-center inset-x-0 bottom-8"
          onSubmit={handleSubmit}
          action=""
        >
          <div className="relative w-[55%]">
            <input
              className="w-full text-xl decoration-gray-700 border-2 border-gray-300 rounded-full py-4 pl-4 pr-16 text-slate-900 outline-none focus:border-gray-600 bg-gradient-to-l from-slate-800 to-gray-600"
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask me any..."
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-400 cursor-pointer transition"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default TextAi;
