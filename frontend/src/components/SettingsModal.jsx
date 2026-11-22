import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../redux/authSlice";
import { showToast } from "../redux/toastSlice";
import api from "../utils/api";
import Avatar from "./Avatar";
import { 
  X, 
  Lock, 
  LogOut, 
  Sparkles, 
  ShieldCheck, 
  KeyRound,
  AlertTriangle,
  UserCheck
} from "lucide-react";

export default function SettingsModal({ onClose }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      dispatch(showToast("error", "New password must be at least 6 characters long."));
      return;
    }
    if (newPassword !== confirmPassword) {
      dispatch(showToast("error", "New passwords do not match."));
      return;
    }

    setPasswordLoading(true);
    try {
      await api.patch("/profile/password", { currentPassword, newPassword });
      dispatch(showToast("success", "Password updated successfully!"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      dispatch(showToast("error", err.message));
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleConfirmLogout = () => {
    dispatch(logoutUser());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
              <ShieldCheck className="w-4 h-4 text-brand-400" />
            </div>
            <h2 className="text-base font-bold text-white">Account Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* User Account Summary */}
          {user && (
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80">
              <Avatar
                src={user.photoUrl}
                name={user.firstName}
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-white truncate">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-xs text-slate-400 truncate">{user.emailId}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>DevTinder Pro Member</span>
                </div>
              </div>
            </div>
          )}

          {/* AI Features Enabled Badge */}
          <div className="p-3.5 rounded-2xl bg-brand-500/10 border border-brand-500/20">
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-300 mb-1">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span>Google Gemini AI Engine Active</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Semantic embeddings, match explanations, and automated GitHub profile builder are enabled.
            </p>
          </div>

          {/* Change Password Form */}
          <form onSubmit={handleChangePassword} className="space-y-3 pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-2">
              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
              <span>Change Password</span>
            </div>

            <div>
              <input
                type="password"
                placeholder="Current Password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="New Password (min 6 chars)"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Confirm New Password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all disabled:opacity-50"
            >
              {passwordLoading ? "Updating Password..." : "Update Password"}
            </button>
          </form>

          {/* Logout Section with Confirmation */}
          <div className="pt-4 border-t border-slate-800/80">
            {!showLogoutConfirm ? (
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of DevTinder</span>
              </button>
            ) : (
              <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-center space-y-2.5">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-rose-300">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Are you sure you want to log out?</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmLogout}
                    className="flex-1 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/30"
                  >
                    Yes, Log Out
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
