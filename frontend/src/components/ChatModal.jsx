import React, { useState, useEffect } from "react";
import Avatar from "./Avatar";
import api from "../utils/api";
import { X, Send, Sparkles, RefreshCw } from "lucide-react";

export default function ChatModal({ targetUser, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "them",
      text: `Hey! Excited to connect on DevTinder! Saw you work with ${
        (targetUser?.skills || [])[0] || "modern tech"
      }. What are you currently building?`,
      time: "Just now",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [icebreakers, setIcebreakers] = useState([]);
  const [icebreakerLoading, setIcebreakerLoading] = useState(false);

  // Fetch AI Icebreakers for this match
  useEffect(() => {
    if (!targetUser?._id) return;
    setIcebreakerLoading(true);
    api
      .get(`/ai/icebreakers/${targetUser._id}`)
      .then((res) => {
        if (res.data.data?.icebreakers) {
          setIcebreakers(res.data.data.icebreakers);
        }
      })
      .catch(() => {
        setIcebreakers([
          `Hey ${targetUser.firstName}! What is your favorite tech stack to build with?`,
          `Are you currently working on any open source or hackathon projects?`,
          `Would love to hear more about your experience in ${(targetUser.skills || [])[0] || "tech"}!`,
        ]);
      })
      .finally(() => setIcebreakerLoading(false));
  }, [targetUser?._id]);

  if (!targetUser) return null;

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: "me",
      text: inputText.trim(),
      time: "Just now",
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");

    // Simulate smart auto-reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "them",
          text: "That sounds awesome! Let's definitely collaborate and share GitHub repos.",
          time: "Just now",
        },
      ]);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col h-[540px] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar
                src={targetUser.photoUrl}
                name={targetUser.firstName}
                className="w-10 h-10 rounded-xl object-cover"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-900" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {targetUser.firstName} {targetUser.lastName}
              </h3>
              <p className="text-[11px] text-brand-400 font-mono">
                {targetUser.headline || "Full Stack Developer"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          <div className="text-center my-2">
            <span className="text-[10px] font-mono text-slate-500 px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800">
              ⚡ Matched & Connected on DevTinder
            </span>
          </div>

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === "me" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.sender === "me"
                    ? "bg-brand-600 text-white rounded-br-none shadow-md shadow-brand-600/20"
                    : "bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.time}</span>
            </div>
          ))}
        </div>

        {/* FEATURE 4: AI Icebreakers Chips Stream */}
        <div className="px-3 py-2 bg-slate-950/90 border-t border-slate-800/80 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-400">
            <Sparkles className="w-3 h-3 text-pink-400" />
            <span>Gemini AI Conversation Starters:</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            {icebreakerLoading ? (
              <span className="text-slate-500 italic text-[10px]">Generating smart icebreakers...</span>
            ) : (
              icebreakers.map((starter, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInputText(starter)}
                  className="hover:text-brand-300 text-slate-300 truncate max-w-xs whitespace-nowrap bg-slate-900 hover:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-800/80 transition-colors shrink-0 text-left"
                >
                  "{starter}"
                </button>
              ))
            )}
          </div>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
          <input
            type="text"
            placeholder="Type a message or click an AI icebreaker..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white disabled:opacity-40 transition-all shadow-md shadow-brand-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
