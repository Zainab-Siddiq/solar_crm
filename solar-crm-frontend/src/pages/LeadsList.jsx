import { useEffect, useState, useRef, useCallback } from "react";
import { API } from "../api/api";
import { useNavigate } from "react-router-dom";

const CALL_STATUS_COLORS = {
  "Interested":      { bg: "bg-green-100",  text: "text-green-700",  dot: "bg-green-500"  },
  "Not responding":  { bg: "bg-gray-100",   text: "text-gray-600",   dot: "bg-gray-400"   },
  "Cash flow":       { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500" },
  "Budget issue":    { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500" },
  "Out of city":     { bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500" },
  "Cola solar":      { bg: "bg-red-100",    text: "text-red-700",    dot: "bg-red-500"    },
  "Bank financing":  { bg: "bg-blue-100",   text: "text-blue-700",   dot: "bg-blue-500"   },
  "Time issue":      { bg: "bg-pink-100",   text: "text-pink-700",   dot: "bg-pink-500"   },
};

const DEFAULT_STATUS_COLOR = { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };

function StatusBadge({ status }) {
  const c = CALL_STATUS_COLORS[status] || DEFAULT_STATUS_COLOR;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
}

function getInitials(name) {
  if (!name) return "?";
  return name.trim().split(" ").slice(0, 2).map(w => w[0].toUpperCase()).join("");
}

const AVATAR_COLORS = [
  "bg-orange-100 text-orange-700",
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-purple-100 text-purple-700",
  "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700",
];

function getAvatarColor(name) {
  const i = (name?.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[i];
}

export default function LeadsList() {
  const navigate = useNavigate();

  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [totalCount, setTotalCount] = useState(0);

  const searchRef = useRef();
  const listRef = useRef();
  const debounceTimer = useRef();

  // ── Fetch with debounce ──
  const fetchLeads = useCallback(async (query = "") => {
    setLoading(true);
    try {
      const res = await API.get(`/leads?search=${encodeURIComponent(query)}`);
      setLeads(res.data);
      setTotalCount(res.data.length);
      setHighlightedIndex(res.data.length > 0 ? 0 : -1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads("");
    searchRef.current?.focus();
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => fetchLeads(val), 300);
  };

  // ── Keyboard navigation ──
  const handleSearchKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, leads.length - 1));
      scrollToItem(Math.min(highlightedIndex + 1, leads.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
      scrollToItem(Math.max(highlightedIndex - 1, 0));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      navigate(`/lead/${leads[highlightedIndex].id}`);
    } else if (e.key === "Escape") {
      setSearch("");
      fetchLeads("");
    }
  };

  const scrollToItem = (index) => {
    if (listRef.current) {
      const item = listRef.current.children[index];
      item?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (listRef.current && highlightedIndex >= 0) {
      const item = listRef.current.children[highlightedIndex];
      item?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [highlightedIndex]);

  // Global shortcut: "/" to focus search, "N" to add lead
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === "INPUT") return;
      if (e.key === "/" ) { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === "n" || e.key === "N") { navigate("/add-lead"); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── TOP BAR ── */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">

          {/* Title + count */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-semibold text-gray-800">Leads</h1>
              <p className="text-xs text-gray-400">
                {loading ? "Loading..." : `${totalCount} ${totalCount === 1 ? "lead" : "leads"}`}
              </p>
            </div>
          </div>

          {/* Add button */}
          <button
            onClick={() => navigate("/add-lead")}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 active:scale-95 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Lead
            <kbd className="ml-1 px-1.5 py-0.5 text-xs bg-orange-400 rounded font-mono">N</kbd>
          </button>

        </div>
      </div>

      {/* ── SEARCH BAR ── */}
      <div className="bg-white border-b border-gray-100 px-6 py-3">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={searchRef}
              className="w-full pl-9 pr-20 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none
                         focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
              placeholder="Search by name or phone number..."
              value={search}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {search && (
                <button
                  onClick={() => { setSearch(""); fetchLeads(""); searchRef.current?.focus(); }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <kbd className="px-1.5 py-0.5 text-xs text-gray-400 bg-gray-100 rounded font-mono border border-gray-200">/</kbd>
            </div>
          </div>

          {/* Keyboard hints */}
          <div className="flex items-center gap-4 mt-2">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-500 font-mono text-xs">↑↓</kbd>
              navigate
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-500 font-mono text-xs">Enter</kbd>
              open
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-500 font-mono text-xs">Esc</kbd>
              clear
            </span>
          </div>
        </div>
      </div>

      {/* ── LEADS LIST ── */}
      <div className="flex-1 px-6 py-4">
        <div className="max-w-3xl mx-auto">

          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-1/3" />
                      <div className="h-3 bg-gray-200 rounded w-1/4" />
                    </div>
                    <div className="h-5 w-20 bg-gray-200 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && leads.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">
                {search ? `No leads found for "${search}"` : "No leads yet"}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {search ? "Try a different search term" : "Press N to add your first lead"}
              </p>
            </div>
          )}

          {/* Lead cards */}
          {!loading && leads.length > 0 && (
            <ul ref={listRef} className="space-y-2">
              {leads.map((lead, index) => {
                const isHighlighted = index === highlightedIndex;
                const avatarColor = getAvatarColor(lead.client_name);
                return (
                  <li
                    key={lead.id}
                    onClick={() => navigate(`/lead/${lead.id}`)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`group bg-white rounded-xl border transition-all cursor-pointer
                      ${isHighlighted
                        ? "border-orange-300 ring-2 ring-orange-100 shadow-sm"
                        : "border-gray-100 hover:border-gray-200 hover:shadow-sm"}`}
                  >
                    <div className="p-4 flex items-center gap-4">

                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${avatarColor}`}>
                        {getInitials(lead.client_name)}
                      </div>

                      {/* Main info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-800 text-sm truncate">
                            {lead.client_name}
                          </span>
                          {lead.meeting_aligned && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-md font-medium">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              Meeting
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          <span className="text-xs text-gray-400 font-mono">{lead.contact_number}</span>
                          <span className="text-gray-200 text-xs">|</span>
                          <span className="text-xs text-gray-400">{lead.city}</span>
                          <span className="text-gray-200 text-xs">|</span>
                          <span className="text-xs text-gray-400">{lead.system_size_kw} KW</span>
                          {lead.followup_count > 0 && (
                            <>
                              <span className="text-gray-200 text-xs">|</span>
                              <span className="text-xs text-orange-500 font-medium">
                                {lead.followup_count} followup{lead.followup_count > 1 ? "s" : ""}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Status + arrow */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <StatusBadge status={lead.call_status} />
                        <svg
                          className={`w-4 h-4 transition-all ${isHighlighted ? "text-orange-400 translate-x-0.5" : "text-gray-300"}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>

                    </div>
                  </li>
                );
              })}
            </ul>
          )}

        </div>
      </div>

    </div>
  );
}