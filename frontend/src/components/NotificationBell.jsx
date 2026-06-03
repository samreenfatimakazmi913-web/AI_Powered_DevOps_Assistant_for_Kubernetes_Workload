import React, { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotificationBell({ alerts = [] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  /* 🔒 Close dropdown on outside click */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* 🧠 Remove duplicate pods */
  const uniqueAlerts = Object.values(
    alerts.reduce((acc, pod) => {
      acc[pod.metadata?.name] = pod;
      return acc;
    }, {})
  );
  const navigate = useNavigate();

  return (
    <div className="relative" ref={ref}>
      {/* 🔔 Bell Icon */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-slate-100 transition"
      >
        <Bell size={20} />

        {/* 🔴 Badge */}
        {uniqueAlerts.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
            {uniqueAlerts.length}
          </span>
        )}
      </button>

      {/* 📥 Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-border rounded-xl shadow-lg z-50">
          
          {/* Header */}
          <div className="p-3 border-b text-sm font-semibold text-slate-700 flex justify-between">
            Alerts
            {uniqueAlerts.length > 0 && (
              <span className="text-xs text-red-500 font-medium">
                {uniqueAlerts.length} active
              </span>
            )}
          </div>

          {/* Empty state */}
          {uniqueAlerts.length === 0 ? (
            <div className="p-4 text-sm text-slate-400 text-center">
              No issues 🎉
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {uniqueAlerts.map((p, i) => {
                const cs =
                  p.status?.containerStatuses?.find((c) => !c.ready) ||
                  p.status?.containerStatuses?.[0];

                const reason =
                  cs?.state?.waiting?.reason ||
                  cs?.state?.terminated?.reason ||
                  p.status?.phase;

                return (
                  <div
  key={i}
  onClick={() =>
    navigate(
      `/workloads?tab=pods&pod=${p.metadata?.name}&ns=${p.metadata?.namespace}`
    )
  }
  className="p-3 border-b text-sm hover:bg-slate-50 cursor-pointer"
>
                    <div className="flex items-center justify-between">

                      {/* Left */}
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>

                        <div>
                          <div className="text-sm font-medium text-slate-800">
                            {p.metadata?.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {p.metadata?.namespace}
                          </div>
                        </div>
                      </div>

                      {/* Right */}
                      <div className="text-xs text-red-500 font-semibold">
                        {reason}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}