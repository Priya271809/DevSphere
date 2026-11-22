import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { setFilterSkill, fetchFeed } from "../redux/feedSlice";
import Avatar from "./Avatar";
import { 
  CheckCircle2, 
  Sparkles, 
  Target, 
  Star, 
  Users, 
  Briefcase, 
  Laptop, 
  Handshake,
  ArrowRight,
  Flame
} from "lucide-react";

export default function ExploreHub({ setActiveTab, onOpenSettings }) {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);

  const handleFilterSelect = (filterName, skillQuery = "") => {
    dispatch(setFilterSkill(skillQuery));
    dispatch(fetchFeed({ page: 1, limit: 20, skill: skillQuery }));
    setActiveTab("cards");
  };

  const discoverTags = [
    {
      id: "verified",
      title: "Verified Profiles",
      icon: CheckCircle2,
      color: "text-emerald-400 border-emerald-500/30 bg-emerald-950/20",
      query: "React",
    },
    {
      id: "new",
      title: "New on DevTinder",
      icon: Sparkles,
      color: "text-amber-400 border-amber-500/30 bg-amber-950/20",
      query: "TypeScript",
    },
    {
      id: "goal",
      title: "Matches Your Goal",
      icon: Target,
      color: "text-rose-400 border-rose-500/30 bg-rose-950/20",
      query: "Node.js",
    },
    {
      id: "connected",
      title: "Highly Connected",
      icon: Star,
      color: "text-sky-400 border-sky-500/30 bg-sky-950/20",
      query: "Python",
    },
  ];

  const categoryCards = [
    {
      id: "networking",
      title: "Networking",
      subtitle: "Find out the Networking",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80",
      name: "Aarav",
      query: "Casual Networking",
    },
    {
      id: "talent",
      title: "Talent / Co-founder",
      subtitle: "Find out the Talent",
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80",
      name: "Devon",
      query: "Co-founder",
    },
    {
      id: "client",
      title: "Client / Customer",
      subtitle: "Find out the Client / Project",
      photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80",
      name: "Riya",
      query: "Project Collaborator",
    },
    {
      id: "service",
      title: "Service Provider / Mentor",
      subtitle: "Find out the Service Provider",
      photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80",
      name: "Ananya",
      query: "Mentorship",
    },
  ];

  return (
    <div className="max-w-md sm:max-w-2xl lg:max-w-4xl mx-auto px-4 py-5 pb-24 sm:pb-12 animate-fade-in">
      
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Explore</h1>
          <p className="text-xs text-slate-400 mt-0.5">Discover developers, projects & opportunities</p>
        </div>

        {currentUser && (
          <div 
            onClick={onOpenSettings}
            className="cursor-pointer group flex items-center gap-2"
          >
            <Avatar
              src={currentUser.photoUrl}
              name={currentUser.firstName}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-500/40 group-hover:ring-brand-500 transition-all"
            />
          </div>
        )}
      </div>

      {/* Section 1: Discover */}
      <div className="mb-8">
        <div className="mb-3">
          <h2 className="text-lg font-bold text-white tracking-tight">Discover</h2>
          <p className="text-xs text-slate-400">Explore what's happening now</p>
        </div>

        {/* 2x2 Discover Badges Grid */}
        <div className="grid grid-cols-2 gap-3">
          {discoverTags.map((tag) => {
            const Icon = tag.icon;
            return (
              <button
                key={tag.id}
                onClick={() => handleFilterSelect(tag.title, tag.query)}
                className={`p-3.5 rounded-2xl border ${tag.color} flex items-center gap-2.5 text-left transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="text-xs font-semibold text-slate-200 truncate">
                  {tag.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 2: What Are You Looking For */}
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">What Are You Looking For</h2>
            <p className="text-xs text-slate-400">Find best of the connection for you</p>
          </div>
        </div>

        {/* 2x2 Category Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {categoryCards.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleFilterSelect(cat.title, cat.query)}
              className="group cursor-pointer rounded-2xl bg-gradient-to-b from-[#141721] to-[#0c0e14] border border-slate-800/80 hover:border-brand-500/50 p-3 sm:p-4 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/10 flex flex-col items-center text-center relative overflow-hidden"
            >
              {/* Profile Image with Ring */}
              <div className="relative mb-3">
                <Avatar
                  src={cat.photo}
                  name={cat.name}
                  className="w-18 h-18 sm:w-20 sm:h-20 rounded-full object-cover ring-2 ring-slate-800 group-hover:ring-brand-500/60 transition-all duration-300"
                />
                <span className="absolute bottom-0 right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
              </div>

              {/* Title & Subtitle */}
              <h3 className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors">
                {cat.title}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                {cat.subtitle}
              </p>

              {/* Hover Pill action */}
              <div className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold text-brand-400 opacity-80 group-hover:opacity-100 transition-opacity">
                <span>Explore Devs</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Direct Quick Swipe Action Banner */}
      <div 
        onClick={() => setActiveTab("cards")}
        className="cursor-pointer p-4 rounded-2xl bg-gradient-to-r from-brand-600/20 via-pink-600/20 to-purple-600/20 border border-brand-500/30 flex items-center justify-between hover:border-brand-500/60 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-pink-500 flex items-center justify-center text-white shadow-md">
            <Flame className="w-5 h-5 fill-white/20" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Jump to Swipe Deck</h4>
            <p className="text-[11px] text-slate-400">Match with top developers right now</p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-brand-400" />
      </div>

    </div>
  );
}
