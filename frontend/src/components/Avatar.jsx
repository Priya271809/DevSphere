import React, { useState } from "react";

// Vibrant gradient palette for developers
const GRADIENTS = [
  "from-indigo-500 to-purple-600",
  "from-pink-500 to-rose-600",
  "from-emerald-500 to-teal-600",
  "from-cyan-500 to-blue-600",
  "from-amber-500 to-orange-600",
  "from-violet-600 to-indigo-700",
];

// Developer emoji or tech avatar badges
const DEV_ICONS = ["⚡", "🚀", "💻", "🔥", "👾", "⚛️", "🛠️", "🧠"];

export default function Avatar({
  src,
  name = "Dev",
  className = "w-16 h-16 rounded-2xl object-cover",
  alt = "Developer Avatar",
}) {
  const [imgFailed, setImgFailed] = useState(false);

  // Compute deterministic gradient and icon from name
  const charCodeSum = (name || "D")
    .split("")
    .reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const gradient = GRADIENTS[charCodeSum % GRADIENTS.length];
  const devIcon = DEV_ICONS[charCodeSum % DEV_ICONS.length];
  const initials = (name || "D")
    .trim()
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // If no src or image failed to load, render an inline pure-CSS/SVG developer avatar (Zero network request, 100% reliable)
  if (!src || imgFailed) {
    return (
      <div
        className={`${className} bg-gradient-to-tr ${gradient} flex items-center justify-center font-bold text-white shadow-inner relative overflow-hidden select-none border border-white/20`}
      >
        <span className="text-sm sm:text-base tracking-wider drop-shadow-md">
          {initials}
        </span>
        <span className="absolute bottom-0 right-0 text-[10px] sm:text-xs opacity-90 drop-shadow">
          {devIcon}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setImgFailed(true)}
      className={`${className} border border-slate-700/60 shadow-md`}
      loading="lazy"
    />
  );
}
