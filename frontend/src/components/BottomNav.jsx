import React from "react";
import { useSelector } from "react-redux";
import { 
  Flame, 
  Compass, 
  Inbox, 
  MessageSquare, 
  UserCircle 
} from "lucide-react";

export default function BottomNav({ activeTab, setActiveTab }) {
  const requests = useSelector((state) => state.requests.items);
  const connections = useSelector((state) => state.connections.items);

  const pendingCount = requests ? requests.length : 0;
  const connectionsCount = connections ? connections.length : 0;

  const navItems = [
    { id: "cards", label: "Home", icon: Flame },
    { id: "explore", label: "Explore", icon: Compass },
    { id: "requests", label: "Requests", icon: Inbox, badge: pendingCount },
    { id: "connections", label: "Chats", icon: MessageSquare, badge: connectionsCount },
    { id: "profile", label: "Network", icon: UserCircle },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#090b10]/95 border-t border-slate-800/80 backdrop-blur-xl px-2 py-1.5 sm:hidden">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
                isActive
                  ? "text-brand-400 font-bold"
                  : "text-slate-500 hover:text-slate-300 font-medium"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? "scale-110 text-brand-400" : ""}`} />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px] font-bold bg-rose-500 text-white rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-brand-400 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
