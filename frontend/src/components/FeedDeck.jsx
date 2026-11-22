import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchFeed, sendConnectionAction, setFilterSkill } from "../redux/feedSlice";
import confetti from "canvas-confetti";
import Avatar from "./Avatar";
import api from "../utils/api";
import { 
  X, 
  Check,
  Star, 
  MapPin, 
  Briefcase, 
  Sparkles, 
  RefreshCw, 
  SlidersHorizontal,
  Search,
  ExternalLink,
  Flame,
  Code2
} from "lucide-react";
import { Github, Linkedin } from "./Icons";

const POPULAR_SKILLS = ["All", "React", "Node.js", "TypeScript", "Python", "Go", "Docker", "AWS"];

export default function FeedDeck({ setActiveTab }) {
  const dispatch = useDispatch();
  const { cards, loading, filterSkill } = useSelector((state) => state.feed);

  const [activeSwipeDirection, setActiveSwipeDirection] = useState(null);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchFeed({ page: 1, limit: 20, skill: filterSkill === "All" ? "" : filterSkill }));
    setAiExplanation(null);
  }, [dispatch, filterSkill]);

  const topCard = cards && cards.length > 0 ? cards[0] : null;
  const nextCard = cards && cards.length > 1 ? cards[1] : null;

  useEffect(() => {
    setAiExplanation(null);
  }, [topCard?._id]);

  const handleAction = useCallback(
    (status) => {
      if (!topCard || activeSwipeDirection) return;

      setActiveSwipeDirection(status === "interested" ? "right" : "left");

      if (status === "interested") {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ["#6366f1", "#ec4899", "#10b981"],
        });
      }

      setTimeout(() => {
        dispatch(
          sendConnectionAction({
            targetUserId: topCard._id,
            status,
            targetUser: topCard,
          })
        );
        setActiveSwipeDirection(null);
      }, 250);
    },
    [topCard, activeSwipeDirection, dispatch]
  );

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        handleAction("ignored");
      } else if (e.key === "ArrowRight") {
        handleAction("interested");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleAction]);

  const handleFetchAiExplanation = async () => {
    if (!topCard || aiLoading) return;
    setAiLoading(true);
    try {
      const res = await api.get(`/ai/why-matched/${topCard._id}`);
      setAiExplanation(res.data.data.explanation);
    } catch (err) {
      setAiExplanation("AI match: Complementary technical skill sets for rapid collaboration!");
    } finally {
      setAiLoading(false);
    }
  };

  const handleRefresh = () => {
    dispatch(fetchFeed({ page: 1, limit: 20, skill: filterSkill === "All" ? "" : filterSkill }));
  };

  return (
    <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto px-3 sm:px-4 py-3 pb-24 sm:pb-8 flex flex-col justify-between min-h-[calc(100vh-4.5rem)]">
      
      {/* Top Header matching Screenshot (Screen 1) */}
      <div className="flex items-center justify-between py-2 px-1 mb-2">
        <div className="flex items-center gap-1.5">
          <Flame className="w-6 h-6 text-brand-400 fill-brand-400/20" />
          <span className="text-xl font-bold tracking-tight text-white font-mono lowercase">
            devtinder
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-full border transition-all ${
              showFilters
                ? "bg-brand-500/20 text-brand-400 border-brand-500/40"
                : "text-slate-400 hover:text-white border-slate-800 bg-slate-900/60"
            }`}
            title="Filter by skills"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab("explore")}
            className="p-2 rounded-full text-slate-400 hover:text-white border border-slate-800 bg-slate-900/60 transition-all"
            title="Explore Discover"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expandable Skills Filter Bar */}
      {showFilters && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-3 scrollbar-none animate-fade-in">
          {POPULAR_SKILLS.map((skill) => (
            <button
              key={skill}
              onClick={() => dispatch(setFilterSkill(skill === "All" ? "" : skill))}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
                (filterSkill === "" && skill === "All") || filterSkill === skill
                  ? "bg-brand-600 text-white shadow-md shadow-brand-600/30"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && cards.length === 0 && (
        <div className="w-full h-[540px] bg-slate-900/60 border border-slate-800 rounded-[2.5rem] p-6 animate-pulse flex flex-col justify-end">
          <div className="space-y-3 mb-10">
            <div className="h-6 bg-slate-800 rounded w-1/2" />
            <div className="h-4 bg-slate-800 rounded w-3/4" />
            <div className="h-14 bg-slate-800/60 rounded-xl" />
          </div>
          <div className="flex justify-center gap-6">
            <div className="w-16 h-16 bg-slate-800 rounded-full" />
            <div className="w-16 h-16 bg-slate-800 rounded-full" />
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && cards.length === 0 && (
        <div className="text-center py-16 px-6 bg-slate-900/40 border border-slate-800/80 rounded-[2.5rem] backdrop-blur-xl my-auto">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">You're All Caught Up!</h3>
          <p className="text-slate-400 text-xs max-w-xs mx-auto mb-6">
            You've seen all developer profiles in this filter. Refresh deck or explore other categories.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={() => setActiveTab("explore")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 text-white shadow-lg transition-all"
            >
              Explore Categories
            </button>
          </div>
        </div>
      )}

      {/* Active Card Deck Stack matching Screen 1 in Screenshot */}
      {topCard && (
        <div className="relative w-full flex-1 flex flex-col justify-between my-auto">
          
          {/* Card Behind (Depth Preview) */}
          {nextCard && (
            <div className="absolute inset-0 bg-slate-900/60 border border-slate-800/40 rounded-[2.5rem] scale-[0.96] translate-y-3 opacity-50 pointer-events-none transition-all duration-300" />
          )}

          {/* Top Interactive Full-bleed Card */}
          <div
            className={`relative w-full h-[530px] sm:h-[580px] rounded-[2.5rem] overflow-hidden border border-slate-800/90 shadow-2xl flex flex-col justify-between select-none ${
              activeSwipeDirection === "left"
                ? "animate-swipe-left"
                : activeSwipeDirection === "right"
                ? "animate-swipe-right"
                : "animate-float"
            }`}
          >
            {/* Background Full Photo / Avatar */}
            <div className="absolute inset-0 z-0">
              <Avatar
                src={topCard.photoUrl}
                name={topCard.firstName}
                className="w-full h-full object-cover object-center"
              />
              {/* Dark Gradient Overlay for perfect readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-transparent" />
            </div>

            {/* Top Bar inside card (Match badge & Social links) */}
            <div className="relative z-10 p-5 flex items-center justify-between">
              {topCard.matchScore && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-emerald-500/40 text-emerald-400 text-xs font-bold shadow-lg">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{topCard.matchScore}% Match</span>
                </div>
              )}

              <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                {topCard.githubUrl && (
                  <a
                    href={topCard.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    <Github className="w-3.5 h-3.5" />
                  </a>
                )}
                {topCard.linkedinUrl && (
                  <a
                    href={topCard.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Bottom Card Content directly matching Screen 1 in Screenshot */}
            <div className="relative z-10 p-5 sm:p-6 space-y-2">
              
              {/* Name & Age */}
              <div className="flex items-baseline gap-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
                  {topCard.firstName} {topCard.lastName}
                </h2>
                {topCard.age && (
                  <span className="text-lg font-bold text-slate-300">
                    {topCard.age}
                  </span>
                )}
              </div>

              {/* Headline / Title */}
              <p className="text-xs sm:text-sm font-medium text-slate-200 drop-shadow">
                {topCard.headline || "Full Stack Developer | Problem Solver"}
              </p>

              {/* Sub-pills: Looking for & Location with separator dot */}
              <div className="flex items-center gap-2 text-[11px] text-slate-300 font-medium">
                <span className="flex items-center gap-1 text-brand-300">
                  <Briefcase className="w-3 h-3" />
                  <span>{topCard.lookingFor || "Collaboration"}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-300">
                  <MapPin className="w-3 h-3" />
                  <span>{topCard.location || "Remote"}</span>
                </span>
              </div>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-1 pt-1">
                {(topCard.skills || ["React", "Node.js"]).slice(0, 4).map((skill, index) => (
                  <span
                    key={index}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/15 text-slate-200"
                  >
                    {skill}
                  </span>
                ))}
                {(topCard.skills || []).length > 4 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/10 backdrop-blur-md text-slate-300">
                    +{(topCard.skills || []).length - 4}
                  </span>
                )}
              </div>

              {/* Quoted About Quote */}
              <p className="text-[11px] sm:text-xs text-slate-300/90 italic line-clamp-2 pt-1 border-t border-white/10">
                "{topCard.about || "Excited to connect with developers, build cool projects, and share knowledge."}"
              </p>

              {/* Why You Matched AI button */}
              <div className="pt-1">
                {!aiExplanation ? (
                  <button
                    type="button"
                    onClick={handleFetchAiExplanation}
                    disabled={aiLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/30 hover:bg-brand-500/40 border border-brand-400/40 text-[10px] font-bold text-brand-200 backdrop-blur-md transition-all"
                  >
                    <Sparkles className="w-3 h-3 text-pink-400" />
                    <span>{aiLoading ? "Gemini Analyzing..." : "Why You Matched? (AI)"}</span>
                  </button>
                ) : (
                  <div className="p-2 rounded-xl bg-black/75 backdrop-blur-md border border-brand-500/40 text-[10px] text-brand-200 leading-snug animate-fade-in">
                    <span className="font-bold text-white block">Gemini Insight:</span>
                    <span>{aiExplanation}</span>
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* Floating Action Buttons directly matching Screen 1 (❌ & ✔️) */}
          <div className="flex items-center justify-center gap-8 pt-4">
            
            {/* Reject / Pass Button (White circle with Red ❌) */}
            <button
              type="button"
              onClick={() => handleAction("ignored")}
              disabled={activeSwipeDirection !== null}
              title="Pass (Swipe Left)"
              className="w-15 h-15 sm:w-16 sm:h-16 rounded-full bg-white text-rose-500 shadow-xl shadow-rose-950/40 flex items-center justify-center transition-all hover:scale-110 active:scale-95 group"
            >
              <X className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5] group-hover:scale-110 transition-transform" />
            </button>

            {/* Accept / Connect Button (White circle with Green ✔️) */}
            <button
              type="button"
              onClick={() => handleAction("interested")}
              disabled={activeSwipeDirection !== null}
              title="Connect (Swipe Right)"
              className="w-15 h-15 sm:w-16 sm:h-16 rounded-full bg-white text-emerald-500 shadow-xl shadow-emerald-950/40 flex items-center justify-center transition-all hover:scale-110 active:scale-95 group"
            >
              <Check className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.8] group-hover:scale-110 transition-transform" />
            </button>

          </div>

        </div>
      )}

    </div>
  );
}
