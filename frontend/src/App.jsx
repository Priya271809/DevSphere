import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { checkAuth } from "./redux/authSlice";
import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import AuthModal from "./components/AuthModal";
import FeedDeck from "./components/FeedDeck";
import ExploreHub from "./components/ExploreHub";
import RequestsHub from "./components/RequestsHub";
import ChatDashboard from "./components/ChatDashboard";
import ProfileEditor from "./components/ProfileEditor";
import ToastContainer from "./components/ToastContainer";
import ChatModal from "./components/ChatModal";
import SettingsModal from "./components/SettingsModal";

export default function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);

  // Tabs: "cards" (Home swipe) | "explore" (Discover hub) | "requests" | "connections" | "profile"
  const [activeTab, setActiveTab] = useState("cards");
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#07080b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
          <span className="text-xs font-mono text-slate-500">Connecting to DevTinder Engine...</span>
        </div>
      </div>
    );
  }

  // Auth Portal matching Screen 2 in Screenshot
  if (!isAuthenticated || !user) {
    return (
      <>
        <AuthModal />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080b] text-slate-100 flex flex-col antialiased selection:bg-brand-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area with Page Transitions & Responsive Layout */}
      <main key={activeTab} className="flex-1 page-enter">
        {activeTab === "cards" && <FeedDeck setActiveTab={setActiveTab} />}
        {activeTab === "explore" && (
          <ExploreHub 
            setActiveTab={setActiveTab} 
            onOpenSettings={() => setIsSettingsOpen(true)} 
          />
        )}
        {activeTab === "requests" && <RequestsHub />}
        {(activeTab === "connections" || activeTab === "chats") && (
          <ChatDashboard setActiveTab={setActiveTab} />
        )}
        {activeTab === "profile" && <ProfileEditor />}
      </main>

      {/* Mobile Bottom Navigation Bar directly matching Screenshot */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Account & Security Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal onClose={() => setIsSettingsOpen(false)} />
      )}

      {/* Direct Messaging Chat Modal */}
      {activeChatUser && (
        <ChatModal
          targetUser={activeChatUser}
          onClose={() => setActiveChatUser(null)}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}
