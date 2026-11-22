import React from "react";
import { useSelector } from "react-redux";
import Avatar from "./Avatar";
import { 
  Flame, 
  Compass, 
  Inbox, 
  Users, 
  UserCircle, 
  Settings 
} from "lucide-react";

export default function Navbar({ activeTab, setActiveTab, onOpenSettings }) {
  const { user } = useSelector((state) => state.auth);
  const requests = useSelector((state) => state.requests.items);
  const connections = useSelector((state) => state.connections.items);

  const pendingCount = requests ? requests.length : 0;
  const connectionsCount = connections ? connections.length : 0;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#08090d]/85 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab("cards")}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-pink-500 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Flame className="w-5 h-5 text-white fill-white/20" />
          </div>
          <div className="flex items-center gap-1.5 font-bold tracking-tight text-lg text-white font-mono lowercase">
            <span>devtinder</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 uppercase font-sans">
              PRO
            </span>
          </div>
        </div>

        {/* Navigation Tabs (Desktop / Tablet) */}
        <nav className="hidden sm:flex items-center gap-1 sm:gap-2">
          
          <button
            onClick={() => setActiveTab("cards")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "cards"
                ? "bg-brand-500/15 text-brand-400 border border-brand-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Home</span>
          </button>

          <button
            onClick={() => setActiveTab("explore")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "explore"
                ? "bg-brand-500/15 text-brand-400 border border-brand-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Explore</span>
          </button>

          <button
            onClick={() => setActiveTab("requests")}
            className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "requests"
                ? "bg-brand-500/15 text-brand-400 border border-brand-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Requests</span>
            {pendingCount > 0 && (
              <span className="flex items-center justify-center min-w-[18px] h-4.5 px-1 text-[10px] font-bold rounded-full bg-rose-500 text-white animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("connections")}
            className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "connections"
                ? "bg-brand-500/15 text-brand-400 border border-brand-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Matches</span>
            {connectionsCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {connectionsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "profile"
                ? "bg-brand-500/15 text-brand-400 border border-brand-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <UserCircle className="w-4 h-4" />
            <span>Profile</span>
          </button>

        </nav>

        {/* User Pill & Settings Trigger */}
        <div className="flex items-center gap-2.5">
          {user && (
            <div 
              onClick={onOpenSettings}
              title="Account Settings"
              className="flex items-center gap-2 p-1 pr-3 rounded-full bg-slate-900 border border-slate-800 hover:border-brand-500/50 cursor-pointer transition-all"
            >
              <Avatar
                src={user.photoUrl}
                name={user.firstName}
                className="w-7 h-7 rounded-full object-cover"
              />
              <span className="text-xs font-semibold text-slate-200 hidden md:inline">
                {user.firstName}
              </span>
            </div>
          )}

          <button
            onClick={onOpenSettings}
            title="Account Settings"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
