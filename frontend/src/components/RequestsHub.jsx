import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchRequests, reviewRequestAction } from "../redux/requestsSlice";
import Avatar from "./Avatar";
import { Check, X, Inbox, User, Clock, Code2 } from "lucide-react";

export default function RequestsHub() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.requests);

  useEffect(() => {
    dispatch(fetchRequests());
  }, [dispatch]);

  const handleReview = (requestId, status, requestItem) => {
    dispatch(reviewRequestAction({ requestId, status, requestItem }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Pending Invitations</h1>
          <p className="text-sm text-slate-400 mt-1">
            Developers who want to connect with you. Review and expand your network.
          </p>
        </div>
        <div className="px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold">
          {items.length} Pending
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && items.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse flex items-center gap-4"
            >
              <div className="w-16 h-16 rounded-xl bg-slate-800" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-800 rounded w-1/2" />
                <div className="h-3 bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-slate-800 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && items.length === 0 && (
        <div className="text-center py-16 px-6 bg-slate-900/40 border border-slate-800 rounded-3xl">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">No Pending Requests</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto mt-1">
            When developers express interest in connecting with you, their requests will appear here.
          </p>
        </div>
      )}

      {/* Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((reqItem) => {
          const sender = reqItem.fromUserId;
          if (!sender) return null;

          return (
            <div
              key={reqItem._id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-4 mb-3">
                  <Avatar
                    src={sender.photoUrl}
                    name={sender.firstName}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-800"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-white truncate">
                      {sender.firstName} {sender.lastName}
                    </h3>
                    <p className="text-xs text-brand-400 font-medium truncate">
                      {sender.headline || "Full Stack Developer"}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {sender.location || "Remote"}
                    </p>
                  </div>
                </div>

                {sender.about && (
                  <p className="text-xs text-slate-400 line-clamp-2 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60 mb-3">
                    "{sender.about}"
                  </p>
                )}

                {/* Skills Preview */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {(sender.skills || []).slice(0, 4).map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 font-mono border border-slate-800"
                    >
                      {skill}
                    </span>
                  ))}
                  {(sender.skills || []).length > 4 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400">
                      +{sender.skills.length - 4}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => handleReview(reqItem._id, "rejected", reqItem)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Decline
                </button>
                <button
                  type="button"
                  onClick={() => handleReview(reqItem._id, "accepted", reqItem)}
                  className="flex-1 py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-500/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                  Accept & Connect
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
