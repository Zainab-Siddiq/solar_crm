import { useState, useRef, useEffect } from "react";
import { API } from "../api/api";
import { useNavigate } from "react-router-dom";

const CALL_STATUSES = [
  "Interested", "Not responding", "Cash flow",
  "Budget issue", "Out of city", "Cola solar",
  "Bank financing", "Time issue"
];

const SYSTEM_TYPES = [
  { value: "ongrid", label: "On Grid" },
  { value: "offgrid", label: "Off Grid" },
  { value: "hybrid", label: "Hybrid" },
  { value: "hybrid+ongrid", label: "Hybrid + On Grid" },
];

const FINANCING_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "bank_financing", label: "Bank Financing" },
];

const CITIES = ["Karachi", "Lahore", "Out of City"];

const TELESALES_AGENTS = ["Taimar", "Asra"];

export default function AddLead() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    client_name: "",
    contact_number: "",
    telesales_agent: "Taimar",
    city: "Karachi",
    system_size_kw: "",
    lead_source: "marketing",
    campaign_id: "",
    system_type: "hybrid",
    area_id: "",
    sub_area: "",
    call_status: "Not responding",
    meeting_aligned: false,
    meeting_slot_id: null,
    meeting_location: "",
    meeting_date: "",
    financing_method: "cash",
    remarks: "",
  });

  const [campaigns, setCampaigns] = useState([]);
  const [areas, setAreas] = useState([]);
  const [slots, setSlots] = useState([]);
  const [allSlots, setAllSlots] = useState([]); // kept for non-meeting use
  const [areaSearch, setAreaSearch] = useState("");
  const [areaDropdownOpen, setAreaDropdownOpen] = useState(false);
  const [selectedAreaName, setSelectedAreaName] = useState("");
  const [highlightedAreaIndex, setHighlightedAreaIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const refs = {
    name: useRef(),
    phone: useRef(),
    agent: useRef(),
    size: useRef(),
    systemType: useRef(),
    financing: useRef(),
    city: useRef(),
    areaTrigger: useRef(),
    areaSearch: useRef(),
    subArea: useRef(),
    leadSource: useRef(),
    campaign: useRef(),
    callStatus: useRef(),
    meetingToggle: useRef(),
    location: useRef(),
    date: useRef(),
    slot: useRef(),
    remarks: useRef(),
    submit: useRef(),
  };

  const areaDropdownRef = useRef();
  const areaListRef = useRef();

  useEffect(() => {
    refs.name.current?.focus();
    fetchDropdownData();
    const handleClickOutside = (e) => {
      if (areaDropdownRef.current && !areaDropdownRef.current.contains(e.target)) {
        setAreaDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchDropdownData = async () => {
    try {
      const [campRes, areaRes, slotRes] = await Promise.all([
        API.get("/campaigns"),
        API.get("/areas"),
        API.get("/meeting-slots"),
      ]);
      setCampaigns(campRes.data);
      setAreas(areaRes.data);
      setSlots(slotRes.data);
      if (campRes.data.length > 0) {
        setForm((f) => ({ ...f, campaign_id: campRes.data[0].id }));
      }
    } catch (err) {
      console.error("Failed to load dropdown data", err);
    }
  };

  const fetchAvailableSlots = async (date) => {
  if (!date) return;
  try {
    const res = await API.get(`/meeting-slots/available?date=${date}`);
    setSlots(res.data);
    set("meeting_slot_id", ""); // reset slot when date changes
  } catch (err) {
    console.error(err);
    setSlots([]);
  }
};
  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
  };

  const focusNext = (e, nextRef) => {
    if (e.key === "Enter") {
      e.preventDefault();
      nextRef?.current?.focus();
    }
  };

  const handleSelectKeyDown = (e, nextRef) => {
    if (e.key === "Enter") {
      e.preventDefault();
      nextRef?.current?.focus();
    }
  };

  // ── FINANCING: Left/Right to switch, Enter → city
  const handleFinancingKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      set("financing_method", "cash");
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      set("financing_method", "bank_financing");
    } else if (e.key === "Enter") {
      e.preventDefault();
      refs.city.current?.focus();
    }
  };

  // ── MEETING: Left/Right to switch, Enter → next field
  const handleMeetingKeyDown = (e) => {
  if (e.key === "ArrowLeft")  { e.preventDefault(); set("meeting_aligned", false); }
  if (e.key === "ArrowRight") { e.preventDefault(); set("meeting_aligned", true);  }
  if (e.key === "Enter") {
    e.preventDefault();
    if (form.meeting_aligned) refs.date.current?.focus();  // ← changed from refs.location
    else refs.remarks.current?.focus();
  }
};

  // ── AREA DROPDOWN ──
  const filteredAreas = areas.filter((a) =>
    a.area_name.toLowerCase().includes(areaSearch.toLowerCase())
  );

  const openAreaDropdown = () => {
    setAreaDropdownOpen(true);
    setHighlightedAreaIndex(0);
    setTimeout(() => refs.areaSearch.current?.focus(), 50);
  };

  const selectArea = (area) => {
    set("area_id", area.id);
    setSelectedAreaName(area.area_name);
    setAreaSearch("");
    setAreaDropdownOpen(false);
    setHighlightedAreaIndex(0);
    setTimeout(() => refs.subArea.current?.focus(), 50);
  };

  const handleAreaTriggerKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      openAreaDropdown();
    }
  };

  const handleAreaSearchKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedAreaIndex((i) => Math.min(i + 1, filteredAreas.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedAreaIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredAreas[highlightedAreaIndex]) {
        selectArea(filteredAreas[highlightedAreaIndex]);
      }
    } else if (e.key === "Escape") {
      setAreaDropdownOpen(false);
      refs.areaTrigger.current?.focus();
    }
  };

  useEffect(() => {
    if (areaListRef.current) {
      const item = areaListRef.current.children[highlightedAreaIndex];
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedAreaIndex]);

  useEffect(() => {
    setHighlightedAreaIndex(0);
  }, [areaSearch]);

  const validate = () => {
    const e = {};
    if (!form.client_name.trim()) e.client_name = "Name is required";
    if (!form.contact_number || form.contact_number.length !== 11)
      e.contact_number = "Must be exactly 11 digits";
    if (!form.system_size_kw) e.system_size_kw = "System size is required";
    if (form.lead_source === "marketing" && !form.campaign_id)
      e.campaign_id = "Campaign is required";
    if (form.city === "Karachi" && !form.area_id) e.area_id = "Area is required";
    if (form.meeting_aligned && !form.meeting_slot_id)
      e.meeting_slot_id = "Time slot is required";
    if (form.meeting_aligned && !form.meeting_location.trim())
      e.meeting_location = "Location is required";
    if (form.meeting_aligned && !form.meeting_date) e.meeting_date = "Meeting date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await API.post("/leads", {
        ...form,
        system_size_kw: Number(form.system_size_kw),
        campaign_id: form.lead_source === "marketing" ? Number(form.campaign_id) : null,
        area_id: form.city === "Karachi" ? Number(form.area_id) : null,
        meeting_date: form.meeting_aligned ? form.meeting_date : null,
        meeting_slot_id: form.meeting_aligned ? Number(form.meeting_slot_id) : null,
        meeting_location: form.meeting_aligned ? form.meeting_location : null,
      });
      navigate("/");
    } catch (err) {
      const detail = err.response?.data?.detail;
      alert(typeof detail === "string" ? detail : JSON.stringify(detail));
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-3 py-2 text-sm rounded-lg border bg-white text-gray-800 outline-none transition-all
     focus:ring-2 focus:ring-orange-400 focus:border-orange-400
     ${errors[field] ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"}`;

  const selectClass = (field) =>
    `w-full px-3 py-2 text-sm rounded-lg border bg-white text-gray-800 outline-none transition-all cursor-pointer
     focus:ring-2 focus:ring-orange-400 focus:border-orange-400
     ${errors[field] ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"}`;

  const labelClass = "block text-xs font-medium text-gray-500 mb-1";
  const errorClass = "text-xs text-red-500 mt-1";

  const toggleBtn = (active, color = "orange") => {
    const colors = {
      orange: active ? "bg-orange-500 border-orange-500 text-white" : "bg-white border-gray-200 text-gray-600 hover:border-orange-300",
      green: active ? "bg-green-500 border-green-500 text-white" : "bg-white border-gray-200 text-gray-600 hover:border-green-300",
      gray: active ? "bg-gray-500 border-gray-500 text-white" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300",
    };
    return `flex-1 py-2 text-sm rounded-lg border transition-all font-medium focus:outline-none ${colors[color]}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <button type="button" onClick={() => navigate("/")} className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-base font-semibold text-gray-800">Add New Lead</h1>
          <p className="text-xs text-gray-400">Enter to move between fields · ← → for toggles · ↑↓ for area list</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 space-y-5">

        {/* CLIENT INFO */}
        <Section title="Client Information">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelClass}>Client Name *</label>
              <input
                ref={refs.name}
                className={inputClass("client_name")}
                placeholder="Enter full name"
                value={form.client_name}
                onChange={(e) => set("client_name", e.target.value)}
                onKeyDown={(e) => focusNext(e, refs.phone)}
                autoComplete="off"
              />
              {errors.client_name && <p className={errorClass}>{errors.client_name}</p>}
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Contact Number * (11 digits)</label>
              <input
                ref={refs.phone}
                className={inputClass("contact_number")}
                placeholder="03XXXXXXXXX"
                value={form.contact_number}
                maxLength={11}
                onChange={(e) => set("contact_number", e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => focusNext(e, refs.agent)}
              />
              {errors.contact_number && <p className={errorClass}>{errors.contact_number}</p>}
            </div>

            <div className="col-span-2">
              <label className={labelClass}>
                Telesales Agent
                <span className="ml-2 font-normal text-gray-400 text-xs">(← → to switch, Enter to continue)</span>
              </label>
              <div
                ref={refs.agent}
                tabIndex={0}
                className="flex gap-3 outline-none rounded-lg focus:ring-2 focus:ring-orange-300 p-0.5"
                onKeyDown={(e) => {
                  if (e.key === "ArrowLeft") { e.preventDefault(); set("telesales_agent", TELESALES_AGENTS[0]); }
                  if (e.key === "ArrowRight") { e.preventDefault(); set("telesales_agent", TELESALES_AGENTS[1]); }
                  if (e.key === "Enter") { e.preventDefault(); refs.size.current?.focus(); }
                }}
              >
                {TELESALES_AGENTS.map((agent) => (
                  <button
                    key={agent}
                    type="button"
                    tabIndex={-1}
                    onClick={() => { set("telesales_agent", agent); refs.agent.current?.focus(); }}
                    className={toggleBtn(form.telesales_agent === agent, "orange")}
                  >
                    {agent}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* SYSTEM DETAILS */}
        <Section title="System Details">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>System Size (KW) *</label>
              <input
                ref={refs.size}
                className={inputClass("system_size_kw")}
                placeholder="e.g. 10"
                type="number"
                value={form.system_size_kw}
                onChange={(e) => set("system_size_kw", e.target.value)}
                onKeyDown={(e) => focusNext(e, refs.systemType)}
              />
              {errors.system_size_kw && <p className={errorClass}>{errors.system_size_kw}</p>}
            </div>

            <div>
              <label className={labelClass}>System Type</label>
              <select
                ref={refs.systemType}
                className={selectClass("system_type")}
                value={form.system_type}
                onChange={(e) => set("system_type", e.target.value)}
                onKeyDown={(e) => handleSelectKeyDown(e, refs.financing)}
              >
                {SYSTEM_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className={labelClass}>
                Financing Method
                <span className="ml-2 font-normal text-gray-400 text-xs">(← → to switch, Enter to continue)</span>
              </label>
              <div
                ref={refs.financing}
                tabIndex={0}
                className="flex gap-3 outline-none rounded-lg focus:ring-2 focus:ring-orange-300 p-0.5"
                onKeyDown={handleFinancingKeyDown}
              >
                {FINANCING_METHODS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    tabIndex={-1}
                    onClick={() => { set("financing_method", m.value); refs.financing.current?.focus(); }}
                    className={toggleBtn(form.financing_method === m.value, "orange")}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* LOCATION */}
        <Section title="Location">
          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className={labelClass}>City</label>
              <select
                ref={refs.city}
                className={selectClass("city")}
                value={form.city}
                onChange={(e) => { set("city", e.target.value); set("area_id", ""); setSelectedAreaName(""); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (form.city === "Karachi") refs.areaTrigger.current?.focus();
                    else if (form.city === "Lahore") refs.subArea.current?.focus();
                    else refs.leadSource.current?.focus();
                  }
                }}
              >
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            {/* AREA — Karachi searchable dropdown */}
            {form.city === "Karachi" && (
              <div ref={areaDropdownRef} className="relative">
                <label className={labelClass}>
                  Area *
                  <span className="ml-2 font-normal text-gray-400 text-xs">(Enter to open, ↑↓ navigate)</span>
                </label>
                <div
                  ref={refs.areaTrigger}
                  tabIndex={0}
                  className={`w-full px-3 py-2 text-sm rounded-lg border bg-white cursor-pointer flex justify-between items-center outline-none transition-all
                    focus:ring-2 focus:ring-orange-400 focus:border-orange-400
                    ${errors.area_id ? "border-red-400" : "border-gray-200 hover:border-gray-300"}`}
                  onClick={openAreaDropdown}
                  onKeyDown={handleAreaTriggerKeyDown}
                >
                  <span className={selectedAreaName ? "text-gray-800" : "text-gray-400"}>
                    {selectedAreaName || "Select area..."}
                  </span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {areaDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    <div className="p-2 border-b border-gray-100">
                      <input
                        ref={refs.areaSearch}
                        className="w-full px-2 py-1.5 text-sm outline-none bg-gray-50 rounded border border-gray-200 focus:border-orange-400"
                        placeholder="Type to search..."
                        value={areaSearch}
                        onChange={(e) => setAreaSearch(e.target.value)}
                        onKeyDown={handleAreaSearchKeyDown}
                      />
                    </div>
                    <ul ref={areaListRef} className="max-h-48 overflow-y-auto">
                      {filteredAreas.length > 0 ? filteredAreas.map((a, i) => (
                        <li
                          key={a.id}
                          className={`px-3 py-2 text-sm cursor-pointer transition-colors
                            ${i === highlightedAreaIndex ? "bg-orange-500 text-white" : "hover:bg-orange-50 hover:text-orange-700"}`}
                          onMouseEnter={() => setHighlightedAreaIndex(i)}
                          onMouseDown={() => selectArea(a)}
                        >
                          {a.area_name}
                        </li>
                      )) : (
                        <li className="px-3 py-3 text-sm text-gray-400 text-center">No areas found</li>
                      )}
                    </ul>
                  </div>
                )}
                {errors.area_id && <p className={errorClass}>{errors.area_id}</p>}
              </div>
            )}

            {form.city !== "Out of City" && (
              <div className="col-span-2">
                <label className={labelClass}>{form.city === "Lahore" ? "Area" : "Sub Area"}</label>
                <input
                  ref={refs.subArea}
                  className={inputClass("sub_area")}
                  placeholder={form.city === "Lahore" ? "Enter area name" : "Enter sub area / block"}
                  value={form.sub_area}
                  onChange={(e) => set("sub_area", e.target.value)}
                  onKeyDown={(e) => focusNext(e, refs.leadSource)}
                />
              </div>
            )}

          </div>
        </Section>

        {/* LEAD SOURCE */}
        <Section title="Lead Source">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Source</label>
              <select
                ref={refs.leadSource}
                className={selectClass("lead_source")}
                value={form.lead_source}
                onChange={(e) => set("lead_source", e.target.value)}
                onKeyDown={(e) => handleSelectKeyDown(e, form.lead_source === "marketing" ? refs.campaign : refs.callStatus)}
              >
                <option value="marketing">Marketing</option>
                <option value="referral">Referral</option>
                <option value="direct">Direct Call</option>
              </select>
            </div>

            {form.lead_source === "marketing" && (
              <div>
                <label className={labelClass}>Campaign *</label>
                <select
                  ref={refs.campaign}
                  className={selectClass("campaign_id")}
                  value={form.campaign_id}
                  onChange={(e) => set("campaign_id", e.target.value)}
                  onKeyDown={(e) => handleSelectKeyDown(e, refs.callStatus)}
                >
                  {campaigns.length === 0
                    ? <option value="">No campaigns found</option>
                    : campaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.campaign_name ?? c.name ?? `Campaign #${c.id}`}
                      </option>
                    ))
                  }
                </select>
                {errors.campaign_id && <p className={errorClass}>{errors.campaign_id}</p>}
              </div>
            )}
          </div>
        </Section>

        {/* STATUS & MEETING */}
        <Section title="Status &amp; Meeting">
          <div className="grid grid-cols-2 gap-4">

            <div className="col-span-2">
              <label className={labelClass}>Call Status</label>
              <select
                ref={refs.callStatus}
                className={selectClass("call_status")}
                value={form.call_status}
                onChange={(e) => set("call_status", e.target.value)}
                onKeyDown={(e) => handleSelectKeyDown(e, refs.meetingToggle)}
              >
                {CALL_STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div className="col-span-2">
              <label className={labelClass}>
                Meeting Aligned
                <span className="ml-2 font-normal text-gray-400 text-xs">(← → to switch, Enter to continue)</span>
              </label>
              <div
                ref={refs.meetingToggle}
                tabIndex={0}
                className="flex gap-3 outline-none rounded-lg focus:ring-2 focus:ring-orange-300 p-0.5"
                onKeyDown={handleMeetingKeyDown}
              >
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => { set("meeting_aligned", false); refs.meetingToggle.current?.focus(); }}
                  className={toggleBtn(!form.meeting_aligned, "gray")}
                >
                  No
                </button>
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => { set("meeting_aligned", true); refs.meetingToggle.current?.focus(); }}
                  className={toggleBtn(form.meeting_aligned, "green")}
                >
                  Yes
                </button>
              </div>
            </div>

            {form.meeting_aligned && (
  <>
    {/* DATE */}
    <div className="col-span-2">
      <label className={labelClass}>Meeting Date *</label>
      <input
        ref={refs.date}
        type="date"
        className={inputClass("meeting_date")}
        value={form.meeting_date}
        onChange={(e) => {
          set("meeting_date", e.target.value);
          fetchAvailableSlots(e.target.value);
        }}
        onFocus={(e) => e.target.showPicker && e.target.showPicker()}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); refs.location.current?.focus(); } }}
      />
      {errors.meeting_date && <p className={errorClass}>{errors.meeting_date}</p>}
    </div>

    {/* LOCATION */}
    <div className="col-span-2">
      <label className={labelClass}>Location (Google Maps link or coordinates) *</label>
      <input
        ref={refs.location}
        className={inputClass("meeting_location")}
        placeholder="https://maps.google.com/... or lat,lng"
        value={form.meeting_location}
        onChange={(e) => set("meeting_location", e.target.value)}
        onKeyDown={(e) => focusNext(e, refs.slot)}
      />
      {errors.meeting_location && <p className={errorClass}>{errors.meeting_location}</p>}
    </div>

    {/* SLOT — only available slots for selected date */}
    <div className="col-span-2">
      <label className={labelClass}>Time Slot *</label>
      <select
        ref={refs.slot}
        className={selectClass("meeting_slot_id")}
        value={form.meeting_slot_id || ""}
        onChange={(e) => set("meeting_slot_id", e.target.value)}
        onKeyDown={(e) => handleSelectKeyDown(e, refs.remarks)}
      >
        <option value="">
          {!form.meeting_date ? "Select date first" : slots.length === 0 ? "No slots available" : "Select time slot"}
        </option>
        {slots.map((s) => (
          <option key={s.id} value={s.id}>
            {s.slot_name} ({s.remaining ?? s.max_bookings} left)
          </option>
        ))}
      </select>
      {errors.meeting_slot_id && <p className={errorClass}>{errors.meeting_slot_id}</p>}
    </div>
  </>
)}

          </div>
        </Section>

        {/* REMARKS */}
        <Section title="Remarks">
          <textarea
            ref={refs.remarks}
            className={`${inputClass("remarks")} resize-none`}
            placeholder="Any additional notes... (Ctrl+Enter to jump to submit)"
            rows={3}
            value={form.remarks}
            onChange={(e) => set("remarks", e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) { e.preventDefault(); refs.submit.current?.focus(); }
            }}
          />
        </Section>

        {/* SUBMIT */}
        <div className="flex gap-3 pb-6">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex-1 py-3 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            ref={refs.submit}
            type="submit"
            disabled={submitting}
            className="flex-1 py-3 text-sm font-semibold text-white bg-orange-500 rounded-xl hover:bg-orange-600 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Saving..." : "Save Lead"}
          </button>
        </div>

      </form>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}