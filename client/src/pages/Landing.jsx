import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  const skillsList = [
    "AI/Machine Learning",
    "Coding",
    "Design",
    "Marketing",
    "Business",
    "Data Science",
    "Healthcare",
    "Education",
    "Engineering",
    "Arts",
  ];

  const interestsList = [
    "Technology",
    "Creative Arts",
    "Healthcare",
    "Business",
    "Science",
    "Education",
    "Social Impact",
    "Finance",
    "Environment",
    "Sports",
  ];

  const [skills, setSkills] = useState([]);
  const [interests, setInterests] = useState([]);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "👋 Hi! Please select your skills and interests first.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // persistent userId stored in localStorage for session memory routing
  const [userId] = useState(() => {
    const existing = localStorage.getItem("mentora_userId");
    if (existing) return existing;
    const newid = "u_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
    localStorage.setItem("mentora_userId", newid);
    return newid;
  });

  const chatEndRef = useRef(null);

  const toggleSkill = (skill) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const toggleInterest = (interest) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  // helper to push a user message into chat
  const pushUserMessage = (text) => {
    setMessages((prev) => [...prev, { role: "user", text }]);
  };

  // helper to push bot message (with optional courses and quickReplies)
  const pushBotMessage = (payload) => {
    // payload: { text, courses, quickReplies }
    setMessages((prev) => [
      ...prev,
      {
        role: "bot",
        text: payload.text,
        courses: payload.courses || [],
        quickReplies: payload.quickReplies || [],
      },
    ]);
  };

  // send message to backend
  const sendMessageToServer = async (msgText) => {
    setIsTyping(true);
    try {
      const res = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msgText,
          skills,
          interests,
          userId, // persistent id
        }),
      });
      const data = await res.json();
      // show bot reply (data.reply) and courses if any
      pushBotMessage({
        text: data.reply || "Hmm...",
        courses: data.courses || [],
        quickReplies: data.quickReplies || [],
      });
    } catch (err) {
      pushBotMessage({
        text: "❌ Server error. Please try again later.",
        courses: [],
      });
    } finally {
      setIsTyping(false);
    }
  };

  // primary send handler
  const handleSend = async (e) => {
    e?.preventDefault?.();

    // require at least one selection
    if (skills.length === 0 || interests.length === 0) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "⚠️ Please select at least one skill and one interest before chatting.",
        },
      ]);
      return;
    }

    // If user didn't type anything but has selections -> send an auto-recommend request
    if (!input.trim()) {
      // optional: show a small user message to indicate action
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          text: "(Show recommendations for selected skills/interests)",
        },
      ]);
      // send empty message (backend will auto-build from skills/interests)
      await sendMessageToServer("");
      return;
    }

    // normal typed message flow
    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    await sendMessageToServer(input);
    setInput("");
  };

  // quick reply click handler (auto sends the quick reply)
  const handleQuickReply = async (replyText) => {
    // If it's a suggestion like Switch interest to "marketing", we can parse it locally:
    const switchMatch = replyText.match(/^Switch interest to "?(.*)"?$/i);
    if (switchMatch) {
      const newInterest = switchMatch[1];
      if (newInterest) {
        // add to interests (UI)
        setInterests((prev) =>
          prev.includes(newInterest) ? prev : [...prev, newInterest]
        );
        pushUserMessage(`Yes, switch interest to ${newInterest}`);
        await sendMessageToServer(`Switch interest to ${newInterest}`);
        return;
      }
    }

    // otherwise, just send it as a user message
    pushUserMessage(replyText);
    await sendMessageToServer(replyText);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
      {/* Top Bar */}
      <div className="flex justify-between items-center px-6 py-4">
        <h1 className="text-white text-2xl font-bold tracking-wide drop-shadow-md">
          ✨ Mentora
        </h1>
        <div className="flex gap-2">
          {/* <button
            onClick={() => navigate("/home")}
            className=" bg-white  px-4 py-2 rounded-xl hover:bg-white/20 transition shadow-lg"
          >
            Book an Schedule
          </button> */}
          <button
            onClick={() => navigate("/")}
            className="text-white bg-white/10 px-4 py-2 rounded-xl hover:bg-white/20 transition shadow-lg"
          >
            Logout
          </button>
          <button
            onClick={() => navigate("/")}
            className="text-white bg-white/10 px-4 py-2 rounded-xl hover:bg-white/20 transition shadow-lg"
          >
            Home
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 gap-6 px-6 pb-6">
        {/* LEFT PANEL: Skills + Interests */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col w-1/3 bg-white/10 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/20 overflow-y-auto custom-scroll"
        >
          <h2 className="text-white text-lg font-semibold mb-3">
            Select Your Skills:
          </h2>
          <div className="flex flex-wrap gap-3 mb-6">
            {skillsList.map((skill) => (
              <motion.button
                key={skill}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleSkill(skill)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition shadow ${
                  skills.includes(skill)
                    ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg"
                    : "bg-white/20 text-gray-100 hover:bg-white/30"
                }`}
              >
                {skill}
              </motion.button>
            ))}
          </div>

          <h2 className="text-white text-lg font-semibold mb-3">
            Select Your Interests:
          </h2>
          <div className="flex flex-wrap gap-3">
            {interestsList.map((interest) => (
              <motion.button
                key={interest}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleInterest(interest)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition shadow ${
                  interests.includes(interest)
                    ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg"
                    : "bg-white/20 text-gray-100 hover:bg-white/30"
                }`}
              >
                {interest}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* RIGHT PANEL: Chat Area */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col w-2/3 bg-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20"
        >
          {/* Chat Messages */}
          <div
            className="flex-1 overflow-y-auto pr-2 custom-scroll"
            style={{ maxHeight: "70vh" }}
          >
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`my-2 max-w-2xl ${
                  msg.role === "user"
                    ? "self-end ml-auto"
                    : "self-start mr-auto"
                }`}
              >
                {/* bot message with courses */}
                {msg.role === "bot" && msg.courses && msg.courses.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-2xl shadow">
                      {msg.text}
                    </div>

                    <ul className="space-y-3 mt-2">
                      {msg.courses.map((course, i) => (
                        <li
                          key={i}
                          className="bg-white/95 p-4 rounded-xl shadow-md border border-gray-200 flex justify-between items-start"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-indigo-700">
                                {course.title}
                              </h3>
                              {course.provider && (
                                <span className="text-xs text-gray-500 ml-2">
                                  • {course.provider}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {course.rating ? `${course.rating}⭐` : ""}{" "}
                              {course.reviews
                                ? `(${course.reviews} reviews)`
                                : ""}
                              {course.level ? ` • ${course.level}` : ""}{" "}
                              {course.duration ? ` • ${course.duration}` : ""}
                            </p>
                            {course.price !== undefined &&
                              course.price !== null && (
                                <p className="text-sm text-gray-600 mt-1">
                                  Price: {course.price}
                                </p>
                              )}
                          </div>

                          <div className="flex flex-col gap-2 ml-4">
                            <a
                              href={course.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                            >
                              👉 View
                            </a>
                            <button
                              onClick={() =>
                                handleQuickReply(`Tell me about #${i + 1}`)
                              }
                              className="text-xs px-2 py-1 border rounded"
                            >
                              Details
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>

                    {/* quick replies for this bot message */}
                    {msg.quickReplies && msg.quickReplies.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {msg.quickReplies.slice(0, 6).map((qr, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleQuickReply(qr)}
                            className="px-3 py-1 bg-white/20 text-white rounded-full text-sm hover:bg-white/30"
                          >
                            {qr}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className={`px-4 py-2 rounded-2xl shadow max-w-md ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                )}
              </motion.div>
            ))}

            {/* typing indicator */}
            {isTyping && (
              <div className="my-2 self-start mr-auto">
                <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-2xl shadow inline-flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-gray-600 animate-pulse" />
                  <div className="h-2 w-2 rounded-full bg-gray-600 animate-pulse delay-150" />
                  <div className="h-2 w-2 rounded-full bg-gray-600 animate-pulse delay-300" />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Box */}
          <form onSubmit={handleSend} className="flex items-center mt-4 gap-3">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 p-3 bg-white/20 text-white placeholder-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-inner"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition shadow-md"
            >
              Send
            </button>
          </form>
        </motion.div>
      </div>

      {/* Custom Scrollbar Styling */}
      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.3); border-radius: 9999px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.5); }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
}
