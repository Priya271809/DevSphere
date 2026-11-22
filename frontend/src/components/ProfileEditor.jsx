import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateProfile } from "../redux/authSlice";
import { showToast } from "../redux/toastSlice";
import api from "../utils/api";
import Avatar from "./Avatar";
import { 
  User, 
  MapPin, 
  Briefcase, 
  Code2, 
  Sparkles, 
  Save, 
  Image as ImageIcon,
  CheckCircle2,
  ExternalLink,
  Wand2
} from "lucide-react";
import { Github, Linkedin } from "./Icons";

export default function ProfileEditor() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    headline: user?.headline || "Full Stack Developer",
    age: user?.age || 25,
    gender: user?.gender || "other",
    photoUrl: user?.photoUrl || "",
    about: user?.about || "",
    skills: (user?.skills || []).join(", "),
    githubUrl: user?.githubUrl || "",
    linkedinUrl: user?.linkedinUrl || "",
    location: user?.location || "Remote",
    lookingFor: user?.lookingFor || "Project Collaborator",
  });

  const [isSaving, setIsSaving] = useState(false);

  // GitHub AI Profile Builder state
  const [ghUsernameInput, setGhUsernameInput] = useState("");
  const [isAiBuilding, setIsAiBuilding] = useState(false);
  const [showGhPrompt, setShowGhPrompt] = useState(false);
  const [aiGeneratedReview, setAiGeneratedReview] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerateFromGitHub = async () => {
    if (!ghUsernameInput.trim()) {
      dispatch(showToast("error", "Please enter a GitHub username."));
      return;
    }

    setIsAiBuilding(true);
    try {
      const res = await api.post("/ai/github-profile", {
        githubUsername: ghUsernameInput.trim(),
      });
      setAiGeneratedReview(res.data.data);
      dispatch(showToast("success", "AI analyzed GitHub repositories successfully!"));
    } catch (err) {
      dispatch(showToast("error", err.message));
    } finally {
      setIsAiBuilding(false);
    }
  };

  const handleApplyAiSuggestions = () => {
    if (!aiGeneratedReview) return;
    setFormData((prev) => ({
      ...prev,
      about: aiGeneratedReview.bio || prev.about,
      skills: Array.isArray(aiGeneratedReview.skills)
        ? aiGeneratedReview.skills.join(", ")
        : prev.skills,
      lookingFor: aiGeneratedReview.lookingFor || prev.lookingFor,
      githubUrl: `https://github.com/${ghUsernameInput.trim()}`,
    }));
    setAiGeneratedReview(null);
    setShowGhPrompt(false);
    dispatch(showToast("info", "AI suggestions applied to form! Click 'Save Changes' to commit."));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const skillsArray = formData.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        headline: formData.headline.trim(),
        age: Number(formData.age) || undefined,
        gender: formData.gender,
        photoUrl: formData.photoUrl.trim() || undefined,
        about: formData.about.trim(),
        skills: skillsArray,
        githubUrl: formData.githubUrl.trim(),
        linkedinUrl: formData.linkedinUrl.trim(),
        location: formData.location.trim(),
        lookingFor: formData.lookingFor,
      };

      await dispatch(updateProfile(payload)).unwrap();
      dispatch(showToast("success", "Profile updated successfully!"));
    } catch (err) {
      dispatch(showToast("error", `Failed to save: ${err.message}`));
    } finally {
      setIsSaving(false);
    }
  };

  const parsedSkills = formData.skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Your Developer Profile</h1>
          <p className="text-sm text-slate-400 mt-1">
            Customize your bio, tech stack, and generate your profile using Gemini AI.
          </p>
        </div>

        {/* FEATURE 3: AI Profile Builder Button */}
        <button
          type="button"
          onClick={() => setShowGhPrompt(!showGhPrompt)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 hover:from-brand-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-brand-500/20 transition-all self-start sm:self-auto"
        >
          <Wand2 className="w-4 h-4" />
          <span>Generate Profile from GitHub (AI)</span>
        </button>
      </div>

      {/* GitHub AI Prompt Accordion / Card */}
      {showGhPrompt && (
        <div className="mb-8 p-6 rounded-3xl bg-slate-900 border border-brand-500/40 shadow-2xl animate-fade-in">
          <div className="flex items-center gap-2 mb-3 text-sm font-bold text-white">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>AI GitHub Profile Builder (Gemini LLM)</span>
          </div>
          <p className="text-xs text-slate-400 mb-4 max-w-xl">
            Enter your GitHub username. We'll pull your public repositories, languages, and topics, and Google Gemini will generate a professional bio, top skills, and matchmaking focus.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Github className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Enter GitHub username (e.g. torvalds, gaearon)"
                value={ghUsernameInput}
                onChange={(e) => setGhUsernameInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
            <button
              type="button"
              onClick={handleGenerateFromGitHub}
              disabled={isAiBuilding}
              className="py-2 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isAiBuilding ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing GitHub...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Analyze Repos</span>
                </>
              )}
            </button>
          </div>

          {/* AI Output Review Modal/Preview */}
          {aiGeneratedReview && (
            <div className="mt-5 p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 animate-fade-in space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400">✨ Generated Suggestions for Review:</span>
                <span className="text-[10px] text-slate-500">Not saved until you click Apply</span>
              </div>
              <div className="text-xs text-slate-300">
                <strong className="text-white block mb-0.5">Bio:</strong>
                "{aiGeneratedReview.bio}"
              </div>
              <div className="text-xs text-slate-300">
                <strong className="text-white block mb-0.5">Skills:</strong>
                {(aiGeneratedReview.skills || []).join(", ")}
              </div>
              <div className="text-xs text-slate-300">
                <strong className="text-white block mb-0.5">Looking For:</strong>
                {aiGeneratedReview.lookingFor}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAiGeneratedReview(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={handleApplyAiSuggestions}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20"
                >
                  Apply to Form
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form Editor (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
          <form onSubmit={handleSave} className="space-y-5">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Headline</label>
              <input
                type="text"
                name="headline"
                placeholder="e.g. Senior Backend Engineer | Rust & Go"
                value={formData.headline}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Age</label>
                <input
                  type="number"
                  name="age"
                  min="16"
                  max="99"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Location</label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. Bengaluru, India"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Photo URL</label>
              <div className="relative">
                <ImageIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="url"
                  name="photoUrl"
                  placeholder="Paste direct image URL or leave empty for auto-generated avatar"
                  value={formData.photoUrl}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Looking For</label>
              <select
                name="lookingFor"
                value={formData.lookingFor}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
              >
                <option value="Project Collaborator">Project Collaborator</option>
                <option value="Hackathon Partner">Hackathon Partner</option>
                <option value="Co-founder">Co-founder</option>
                <option value="Mentorship">Mentorship</option>
                <option value="Casual Networking">Casual Networking</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Skills & Technologies (comma separated)
              </label>
              <input
                type="text"
                name="skills"
                placeholder="React, Node.js, TypeScript, Docker, AWS"
                value={formData.skills}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">About You / Bio</label>
              <textarea
                name="about"
                rows="3"
                placeholder="Share your tech background, current projects, and what you're excited to build..."
                value={formData.about}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">GitHub Profile Link</label>
                <div className="relative">
                  <Github className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="url"
                    name="githubUrl"
                    placeholder="https://github.com/username"
                    value={formData.githubUrl}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">LinkedIn Profile Link</label>
                <div className="relative">
                  <Linkedin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="url"
                    name="linkedinUrl"
                    placeholder="https://linkedin.com/in/username"
                    value={formData.linkedinUrl}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 active:scale-[0.99] shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>

          </form>
        </div>

        {/* Right Column: Live Card Preview (5 cols) */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>Live Feed Card Preview</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-start gap-4 mb-4">
              <Avatar
                src={formData.photoUrl}
                name={formData.firstName}
                className="w-16 h-16 rounded-2xl object-cover shadow-md"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white truncate">
                    {formData.firstName || "Your Name"} {formData.lastName}
                  </h3>
                  {formData.age && (
                    <span className="text-xs font-semibold text-slate-400">{formData.age}</span>
                  )}
                </div>
                <p className="text-xs font-medium text-brand-400 mt-0.5 truncate">
                  {formData.headline || "Full Stack Developer"}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                  <MapPin className="w-3 h-3" />
                  <span>{formData.location || "Remote"}</span>
                </div>
              </div>
            </div>

            {formData.lookingFor && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs font-medium mb-3">
                <Briefcase className="w-3 h-3 text-brand-400" />
                <span>Looking for: <strong className="text-white">{formData.lookingFor}</strong></span>
              </div>
            )}

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 mb-4">
              <p className="text-xs text-slate-300 italic">
                "{formData.about || "Your personal bio and background will appear here..."}"
              </p>
            </div>

            <div className="mb-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Skills
              </span>
              <div className="flex flex-wrap gap-1">
                {(parsedSkills.length > 0 ? parsedSkills : ["React", "Node.js"]).map((skill, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
              <span className="text-[10px] text-emerald-400 font-mono">Active on DevTinder</span>
              <div className="flex gap-2">
                {formData.githubUrl && <Github className="w-3.5 h-3.5 text-slate-400" />}
                {formData.linkedinUrl && <Linkedin className="w-3.5 h-3.5 text-slate-400" />}
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
