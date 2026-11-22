import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, signupUser, clearError } from "../redux/authSlice";
import { 
  Flame, 
  Mail, 
  Lock, 
  User, 
  Sparkles, 
  ArrowRight, 
  Code2, 
  Eye, 
  EyeOff,
  CheckSquare,
  ShieldCheck,
  ChevronLeft
} from "lucide-react";
import { Github, Linkedin } from "./Icons";

export default function AuthModal() {
  const [viewMode, setViewMode] = useState("welcome"); // "welcome" | "email_login" | "email_signup"
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    emailId: "",
    password: "",
    headline: "Full Stack Developer",
    skills: "React, Node.js, TypeScript",
  });

  const dispatch = useDispatch();
  const { actionLoading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    if (error) dispatch(clearError());
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!agreedTerms) {
      alert("Please agree to the Terms & Conditions.");
      return;
    }

    if (viewMode === "email_login") {
      dispatch(
        loginUser({
          emailId: formData.emailId,
          password: formData.password,
        })
      );
    } else {
      const skillsArray = formData.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      dispatch(
        signupUser({
          firstName: formData.firstName,
          lastName: formData.lastName,
          emailId: formData.emailId,
          password: formData.password,
          headline: formData.headline,
          skills: skillsArray.length > 0 ? skillsArray : ["React", "Node.js"],
        })
      );
    }
  };

  const handleQuickDemo = (email, password) => {
    setFormData({
      ...formData,
      emailId: email,
      password: password,
    });
    dispatch(loginUser({ emailId: email, password }));
  };

  return (
    <div className="min-h-screen bg-[#07080b] flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Luxury Copper/Dark Ambient Lighting matching Screenshot Screen 2 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[550px] h-[350px] bg-gradient-to-b from-[#402517]/40 via-[#221611]/20 to-transparent blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm sm:max-w-md relative z-10">
        
        {/* Welcome View directly matching Screenshot Screen 2 */}
        {viewMode === "welcome" ? (
          <div className="space-y-6">
            
            {/* Title & Description */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-7 h-7 text-brand-400 fill-brand-400/20" />
                <span className="text-xl font-bold font-mono tracking-tight text-white lowercase">devtinder</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Welcome
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                New users can create an account, and returning users will be signed in automatically.
              </p>
            </div>

            {/* Previously Signed In Pill matching Screenshot */}
            <div className="p-3 rounded-2xl bg-[#14151c]/90 border border-slate-800 flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 text-xs font-mono">
                @
              </div>
              <div className="text-xs">
                <span className="text-slate-400 block text-[10px]">Quick Login with Demo Account</span>
                <span className="font-semibold text-white">aarav.sharma@example.com</span>
              </div>
            </div>

            {/* Main Action Pill Buttons matching Screenshot Screen 2 */}
            <div className="space-y-3">
              
              {/* 1. Google Pill (White) */}
              <button
                type="button"
                onClick={() => handleQuickDemo("aarav.sharma@example.com", "Password@123")}
                className="w-full py-3.5 px-4 rounded-full font-bold text-sm bg-white text-slate-900 hover:bg-slate-100 flex items-center justify-center gap-2.5 shadow-lg shadow-white/5 transition-all active:scale-[0.99]"
              >
                <span className="text-base font-bold text-blue-600">G</span>
                <span>Sign in with Google (Demo 1)</span>
              </button>

              {/* 2. Email Pill (Warm Brown / Copper matching Screenshot) */}
              <button
                type="button"
                onClick={() => {
                  setViewMode("email_login");
                  dispatch(clearError());
                }}
                className="w-full py-3.5 px-4 rounded-full font-bold text-sm bg-[#523e33] hover:bg-[#60493c] text-white flex items-center justify-center gap-2.5 shadow-lg transition-all active:scale-[0.99]"
              >
                <span className="text-base font-mono">@</span>
                <span>Sign in with Email</span>
              </button>

              {/* 3. LinkedIn Pill (Blue matching Screenshot) */}
              <button
                type="button"
                onClick={() => handleQuickDemo("riya.verma@example.com", "Password@123")}
                className="w-full py-3.5 px-4 rounded-full font-bold text-sm bg-[#0077b5] hover:bg-[#00669c] text-white flex items-center justify-center gap-2.5 shadow-lg transition-all active:scale-[0.99]"
              >
                <Linkedin className="w-4 h-4 text-white" />
                <span>Sign in with LinkedIn (Demo 2)</span>
              </button>

              {/* 4. Apple / GitHub Pill (Dark / Black matching Screenshot) */}
              <button
                type="button"
                onClick={() => {
                  setViewMode("email_signup");
                  dispatch(clearError());
                }}
                className="w-full py-3.5 px-4 rounded-full font-bold text-sm bg-[#121318] hover:bg-[#1a1c24] text-white border border-slate-800 flex items-center justify-center gap-2.5 shadow-lg transition-all active:scale-[0.99]"
              >
                <Github className="w-4 h-4 text-white" />
                <span>Create New Account</span>
              </button>

            </div>

            {/* Terms and Conditions Checkbox matching Screenshot */}
            <div className="flex items-start gap-2.5 pt-2 text-[11px] text-slate-400 leading-tight">
              <input
                type="checkbox"
                id="terms"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 bg-slate-900 text-brand-500 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="terms" className="cursor-pointer">
                By continuing you agree to our <strong className="text-slate-200 underline">Terms & Conditions</strong>, <strong className="text-slate-200 underline">Privacy Policy</strong> & User Agreement. We do not tolerate objectionable or abusive content.
              </label>
            </div>

          </div>
        ) : (
          /* Email Login & Signup Form View */
          <div className="bg-[#10121a]/95 border border-slate-800/90 rounded-[2rem] p-6 sm:p-7 backdrop-blur-xl shadow-2xl animate-fade-in space-y-5">
            
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setViewMode("welcome")}
                className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <h2 className="text-base font-bold text-white">
                {viewMode === "email_login" ? "Sign In with Email" : "Create Account"}
              </h2>
              <div className="w-12" />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleEmailSubmit} className="space-y-3.5">
              {viewMode === "email_signup" && (
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      placeholder="Linus"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full bg-[#08090d] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Torvalds"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full bg-[#08090d] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              )}

              {viewMode === "email_signup" && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Headline</label>
                  <input
                    type="text"
                    name="headline"
                    placeholder="Full Stack Developer"
                    value={formData.headline}
                    onChange={handleChange}
                    className="w-full bg-[#08090d] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    name="emailId"
                    required
                    placeholder="developer@domain.com"
                    value={formData.emailId}
                    onChange={handleChange}
                    className="w-full bg-[#08090d] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-[#08090d] border border-slate-800 rounded-xl pl-9 pr-9 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {viewMode === "email_signup" && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Top Skills (comma separated)</label>
                  <input
                    type="text"
                    name="skills"
                    placeholder="React, Node.js, TypeScript"
                    value={formData.skills}
                    onChange={handleChange}
                    className="w-full bg-[#08090d] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full mt-2 py-3 px-4 rounded-full font-bold text-xs text-white bg-gradient-to-r from-brand-600 to-pink-600 hover:from-brand-500 hover:to-pink-500 shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {actionLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>{viewMode === "email_login" ? "Sign In" : "Register Account"}</span>
                )}
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setViewMode(viewMode === "email_login" ? "email_signup" : "email_login");
                  dispatch(clearError());
                }}
                className="text-xs text-slate-400 hover:text-white"
              >
                {viewMode === "email_login"
                  ? "Don't have an account? Sign Up"
                  : "Already have an account? Sign In"}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
