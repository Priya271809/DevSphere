import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchConnections } from "../redux/connectionsSlice";
import Avatar from "./Avatar";
import { 
  Users, 
  Search, 
  Mail, 
  MessageSquare, 
  ExternalLink,
  Code2,
  MapPin,
  Briefcase
} from "lucide-react";
import { Github, Linkedin } from "./Icons";

export default function ConnectionsHub({ setActiveTab, onOpenChat }) {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.connections);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(fetchConnections());
  }, [dispatch]);

  const filteredConnections = items.filter((user) => {
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
    const skillsStr = (user.skills || []).join(" ").toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    return fullName.includes(query) || skillsStr.includes(query);
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Your Tech Matches</h1>
          <p className="text-sm text-slate-400 mt-1">
            Engineers you've mutually connected with. Collaborate, pair program, and ship.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && items.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-800" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 bg-slate-800 rounded w-2/3" />
                  <div className="h-3 bg-slate-800 rounded w-1/2" />
                </div>
              </div>
              <div className="h-8 bg-slate-800 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && items.length === 0 && (
        <div className="text-center py-16 px-6 bg-slate-900/40 border border-slate-800 rounded-3xl">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Matches Yet</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
            Swipe right on engineers in the explore deck. Once they accept your interest, they'll appear right here!
          </p>
          <button
            onClick={() => setActiveTab("explore")}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 transition-all"
          >
            Start Exploring Developers
          </button>
        </div>
      )}

      {/* Connections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredConnections.map((user) => (
          <div
            key={user._id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 hover:shadow-xl transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Profile Top */}
              <div className="flex items-start gap-3.5 mb-3">
                <Avatar
                  src={user.photoUrl}
                  name={user.firstName}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-800 group-hover:border-brand-500/40 transition-colors"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-white truncate">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-xs text-brand-400 font-medium truncate">
                    {user.headline || "Full Stack Developer"}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{user.location || "Remote"}</span>
                  </div>
                </div>
              </div>

              {/* Looking for pill */}
              {user.lookingFor && (
                <div className="text-[11px] text-slate-400 mb-3 flex items-center gap-1.5">
                  <Briefcase className="w-3 h-3 text-slate-500" />
                  <span>Looking for: <strong className="text-slate-300">{user.lookingFor}</strong></span>
                </div>
              )}

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {(user.skills || []).slice(0, 4).map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 border border-slate-800"
                  >
                    {skill}
                  </span>
                ))}
                {(user.skills || []).length > 4 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400">
                    +{user.skills.length - 4}
                  </span>
                )}
              </div>
            </div>

            {/* Actions & Links */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {user.githubUrl && (
                  <a
                    href={user.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 transition-colors"
                    title="GitHub Profile"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {user.linkedinUrl && (
                  <a
                    href={user.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 transition-colors"
                    title="LinkedIn Profile"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
              </div>

              <button
                type="button"
                onClick={() => onOpenChat(user)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 border border-brand-500/30 hover:border-brand-500/50 text-xs font-semibold transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Message</span>
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
