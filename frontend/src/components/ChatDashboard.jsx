import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../utils/api";
import Avatar from "./Avatar";
import { 
  Search, 
  Plus, 
  CheckCheck, 
  Send, 
  Sparkles, 
  Phone, 
  Video, 
  Info, 
  MoreVertical, 
  Code2, 
  Paperclip, 
  Smile, 
  ChevronLeft,
  MessageSquare,
  Users
} from "lucide-react";

export default function ChatDashboard({ setActiveTab }) {
  const currentUser = useSelector((state) => state.auth.user);

  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null); // active conversation object
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // AI Icebreakers for active chat
  const [aiIcebreakers, setAiIcebreakers] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  // 1. Fetch all conversations (accepted matches with latest message)
  const fetchConversations = async () => {
    try {
      const res = await api.get("/chat/conversations");
      const list = res.data.data || [];
      setConversations(list);
      if (list.length > 0 && !selectedChat) {
        setSelectedChat(list[0]);
      }
    } catch (err) {
      console.error("Failed to load conversations:", err.message);
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // 2. Fetch messages when selected chat changes
  useEffect(() => {
    if (!selectedChat?.counterpart?._id) return;
    const targetId = selectedChat.counterpart._id;
    setMessagesLoading(true);

    api
      .get(`/chat/messages/${targetId}`)
      .then((res) => {
        setMessages(res.data.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setMessagesLoading(false));

    // Fetch AI Icebreakers for this counterpart
    setAiLoading(true);
    api
      .get(`/ai/icebreakers/${targetId}`)
      .then((res) => {
        setAiIcebreakers(res.data.data?.icebreakers || []);
      })
      .catch(() => {
        setAiIcebreakers([
          `Hey! What's the coolest project you're currently building?`,
          `Are you down to team up for an upcoming hackathon?`,
          `Would love to check out your GitHub projects!`,
        ]);
      })
      .finally(() => setAiLoading(false));
  }, [selectedChat?.counterpart?._id]);

  // 3. Send message handler
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || !selectedChat?.counterpart?._id) return;

    const textToSend = inputText.trim();
    setInputText("");

    // Optimistic message append
    const tempId = Date.now().toString();
    const optimisticMsg = {
      _id: tempId,
      senderId: currentUser._id,
      receiverId: selectedChat.counterpart._id,
      text: textToSend,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await api.post(`/chat/messages/${selectedChat.counterpart._id}`, {
        text: textToSend,
      });
      // Replace with saved message from DB
      setMessages((prev) =>
        prev.map((m) => (m._id === tempId ? res.data.data : m))
      );
      // Refresh conversation list to update latest snippet
      fetchConversations();
    } catch (err) {
      console.error("Message send failed:", err.message);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const name = `${c.counterpart?.firstName || ""} ${c.counterpart?.lastName || ""}`.toLowerCase();
    const skills = (c.counterpart?.skills || []).join(" ").toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    return name.includes(q) || skills.includes(q);
  });

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 pb-24 sm:pb-8 h-[calc(100vh-4.5rem)] flex flex-col animate-fade-in">
      
      {/* Top Header matching Image 1 */}
      <div className="flex items-center justify-between mb-3 px-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Chats</h1>
          <p className="text-xs text-slate-400 hidden sm:block">
            Collaborate, share repositories & build with matched developers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden md:block w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#11131a] border border-slate-800 rounded-full pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          {currentUser && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300 hidden sm:inline">
                {currentUser.firstName}
              </span>
              <Avatar
                src={currentUser.photoUrl}
                name={currentUser.firstName}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-500/30"
              />
            </div>
          )}
        </div>
      </div>

      {/* Main 2-Panel Chat Dashboard Container directly matching Image 1 */}
      <div className="flex-1 bg-[#0c0d12] border border-slate-800/90 rounded-[2rem] overflow-hidden flex flex-col md:flex-row shadow-2xl">
        
        {/* LEFT PANEL: Contacts & Conversations Sidebar */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-slate-800/80 bg-[#0f1118]/80 flex flex-col ${
            selectedChat && "hidden md:flex"
          }`}
        >
          {/* Search bar inside left panel */}
          <div className="p-4 border-b border-slate-800/80 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search here..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#161822] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
            <button
              onClick={() => setActiveTab("explore")}
              title="Discover new developers"
              className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-pink-500 text-white flex items-center justify-center shadow-md hover:scale-105 transition-all"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            
            {loadingConversations && (
              <div className="space-y-3 p-2">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="flex items-center gap-3 animate-pulse p-2">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-slate-800 rounded w-1/2" />
                      <div className="h-3 bg-slate-800/60 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loadingConversations && conversations.length === 0 && (
              <div className="text-center py-12 px-4">
                <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-white">No Connected Matches Yet</h4>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  Explore developers and swipe right to start chatting!
                </p>
                <button
                  onClick={() => setActiveTab("cards")}
                  className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold shadow-md"
                >
                  Explore Deck
                </button>
              </div>
            )}

            {/* Pinned / Active Messages */}
            {filteredConversations.length > 0 && (
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-2">
                  Matches & Conversations ({filteredConversations.length})
                </span>

                <div className="space-y-1">
                  {filteredConversations.map((item) => {
                    const cp = item.counterpart;
                    if (!cp) return null;
                    const isSelected = selectedChat?.counterpart?._id === cp._id;

                    return (
                      <div
                        key={cp._id}
                        onClick={() => setSelectedChat(item)}
                        className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                          isSelected
                            ? "bg-[#1c1f2e] border border-brand-500/40 shadow-lg shadow-brand-500/5"
                            : "hover:bg-[#141622] border border-transparent"
                        }`}
                      >
                        {/* Avatar with Online Green Dot */}
                        <div className="relative shrink-0">
                          <Avatar
                            src={cp.photoUrl}
                            name={cp.firstName}
                            className="w-12 h-12 rounded-2xl object-cover"
                          />
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0f1118]" />
                        </div>

                        {/* Name and Latest Message */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                              {cp.firstName} {cp.lastName}
                            </h4>
                            <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                              Just now
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 truncate">
                            {item.latestMessage?.text || "Say hi to start collaborating!"}
                          </p>
                        </div>

                        {/* Unread Badge / Double Checkmark */}
                        <div className="shrink-0 flex items-center">
                          {item.unreadCount > 0 ? (
                            <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">
                              {item.unreadCount}
                            </span>
                          ) : (
                            <CheckCheck className="w-4 h-4 text-brand-400" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* RIGHT PANEL: Active Chat Stream directly matching Image 1 */}
        {selectedChat && selectedChat.counterpart ? (
          <div className="flex-1 flex flex-col bg-[#090a0f] min-w-0">
            
            {/* Active Chat Top Header */}
            <div className="p-3 sm:p-4 border-b border-slate-800/80 bg-[#0f1118]/90 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                {/* Back button for mobile view */}
                <button
                  onClick={() => setSelectedChat(null)}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-300 md:hidden"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="relative shrink-0">
                  <Avatar
                    src={selectedChat.counterpart.photoUrl}
                    name={selectedChat.counterpart.firstName}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl object-cover"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">
                    {selectedChat.counterpart.firstName} {selectedChat.counterpart.lastName}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="truncate">
                      {selectedChat.counterpart.headline || "Online • Full Stack Developer"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chat action icons matching Image 1 */}
              <div className="flex items-center gap-1 sm:gap-2 text-slate-400">
                <button 
                  onClick={() => alert(`Calling ${selectedChat.counterpart.firstName}...`)}
                  className="p-2 rounded-xl hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => alert(`Starting video meeting with ${selectedChat.counterpart.firstName}...`)}
                  className="p-2 rounded-xl hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <Video className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => alert(`Dev Details: ${selectedChat.counterpart.about || "Active Developer"}`)}
                  className="p-2 rounded-xl hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Message Stream Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              
              {/* Match Notice */}
              <div className="text-center my-3">
                <span className="px-3 py-1 rounded-full bg-[#141622] border border-slate-800 text-[10px] font-mono text-slate-400">
                  Connected on DevTinder • End-to-End Encrypted Session
                </span>
              </div>

              {messagesLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId?.toString() === currentUser?._id?.toString();
                  const counterpart = selectedChat.counterpart;

                  return (
                    <div
                      key={msg._id}
                      className={`flex items-end gap-2.5 ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      {/* Left Avatar (Them) */}
                      {!isMe && (
                        <Avatar
                          src={counterpart.photoUrl}
                          name={counterpart.firstName}
                          className="w-7 h-7 rounded-xl object-cover shrink-0 mb-1"
                        />
                      )}

                      {/* Bubble */}
                      <div className="flex flex-col max-w-[85%] sm:max-w-[70%]">
                        {!isMe && (
                          <span className="text-[10px] text-slate-400 font-semibold mb-1 ml-1">
                            {counterpart.firstName}
                          </span>
                        )}
                        <div
                          className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                            isMe
                              ? "bg-gradient-to-r from-brand-600 to-pink-600 text-white rounded-br-none shadow-md shadow-brand-500/20"
                              : "bg-[#181a24] border border-slate-800/90 text-slate-200 rounded-bl-none"
                          }`}
                        >
                          {msg.text}
                        </div>
                        <div className={`flex items-center gap-1 text-[10px] text-slate-500 mt-1 px-1 ${isMe ? "justify-end" : "justify-start"}`}>
                          <span>
                            {msg.createdAt
                              ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                              : "Just now"}
                          </span>
                          {isMe && <CheckCheck className="w-3.5 h-3.5 text-brand-400" />}
                        </div>
                      </div>

                      {/* Right Avatar (Me) */}
                      {isMe && (
                        <Avatar
                          src={currentUser?.photoUrl}
                          name={currentUser?.firstName}
                          className="w-7 h-7 rounded-xl object-cover shrink-0 mb-1"
                        />
                      )}
                    </div>
                  );
                })
              )}

            </div>

            {/* AI Icebreaker Conversation Starters Stream right above input */}
            <div className="px-4 py-2 bg-[#0c0d14] border-t border-slate-800/80 flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-400">
                <Sparkles className="w-3 h-3 text-pink-400" />
                <span>Gemini AI Collaboration Starters:</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                {aiIcebreakers.map((starter, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setInputText(starter)}
                    className="hover:text-brand-300 text-slate-300 truncate max-w-xs whitespace-nowrap bg-[#161822] hover:bg-[#1f2230] px-2.5 py-1 rounded-lg border border-slate-800 transition-colors shrink-0 text-left"
                  >
                    "{starter}"
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Rich Input Bar directly matching Image 1 */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 sm:p-4 bg-[#0f1118] border-t border-slate-800/80 flex flex-col gap-2"
            >
              <input
                type="text"
                placeholder="Write your message here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full bg-[#141620] border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
              />

              <div className="flex items-center justify-between">
                {/* Formatting Tools from screenshot (B, I, U, Code, Clip) */}
                <div className="flex items-center gap-1 text-slate-500">
                  <button
                    type="button"
                    onClick={() => setInputText((prev) => prev + " **bold** ")}
                    className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 text-xs font-bold font-serif"
                    title="Bold"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputText((prev) => prev + " *italic* ")}
                    className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 text-xs italic font-serif"
                    title="Italic"
                  >
                    I
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputText((prev) => prev + " `code` ")}
                    className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 text-xs font-mono"
                    title="Code snippet"
                  >
                    &lt;/&gt;
                  </button>
                  <button
                    type="button"
                    onClick={() => alert("Attachment upload ready")}
                    className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800"
                    title="Attach file / repo"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Purple Send Pill Button from screenshot */}
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 hover:from-brand-500 hover:to-pink-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-brand-500/25 transition-all disabled:opacity-40"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

          </div>
        ) : (
          /* Empty selection state on wide screen */
          <div className="flex-1 hidden md:flex flex-col items-center justify-center p-8 text-center bg-[#090a0f]">
            <div className="w-16 h-16 rounded-3xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mb-3">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white">Select a Developer to Chat</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Choose any matched developer from the left list to collaborate, discuss repositories, and share code.
            </p>
          </div>
        )}

      </div>

    </div>
  );
}
