import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "../api/api";

const CALL_STATUSES = [
    "Interested", "Not responding", "Cash flow",
    "Budget issue", "Out of city", "Cola solar",
    "Bank financing", "Time issue"
];

const CALL_STATUS_COLORS = {
    "Interested": { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
    "Not responding": { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
    "Cash flow": { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500" },
    "Budget issue": { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500" },
    "Out of city": { bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500" },
    "Cola solar": { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
    "Bank financing": { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
    "Time issue": { bg: "bg-pink-100", text: "text-pink-700", dot: "bg-pink-500" },
};

const DEFAULT_COLOR = { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };

function StatusBadge({ status, size = "sm" }) {
    const c = CALL_STATUS_COLORS[status] || DEFAULT_COLOR;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-medium ${size === "sm" ? "text-xs" : "text-sm px-3 py-1"} ${c.bg} ${c.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
            {status}
        </span>
    );
}

function getInitials(name) {
    if (!name) return "?";
    return name.trim().split(" ").slice(0, 2).map(w => w[0].toUpperCase()).join("");
}

function InfoRow({ label, value, mono = false }) {
    if (!value && value !== 0) return null;
    return (
        <div className="flex items-start justify-between py-2.5 border-b border-gray-50 last:border-0">
            <span className="text-xs text-gray-400 font-medium w-32 flex-shrink-0">{label}</span>
            <span className={`text-xs text-gray-700 text-right flex-1 ${mono ? "font-mono" : ""}`}>{value}</span>
        </div>
    );
}

function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })
        + " · "
        + d.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" });
}

function ordinal(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export default function LeadDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [lead, setLead] = useState(null);
    const [followups, setFollowups] = useState([]);
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState("info");

    // ── LOOKUP MAPS (new) ──
    const [areaMap, setAreaMap] = useState({});       // { id: area_name }
    const [campaignMap, setCampaignMap] = useState({}); // { id: campaign_name }
    const [slotMap, setSlotMap] = useState({});         // { id: slot_name }

    const [form, setForm] = useState({
        call_status: "",
        meeting_aligned: false,
        meeting_slot_id: "",
        meeting_location: "",
        meeting_date: "",
        remarks: ""
    });
    const [errors, setErrors] = useState({});

    const refs = {
        callStatus: useRef(),
        meetingToggle: useRef(),
        date: useRef(),
        location: useRef(),
        slot: useRef(),
        remarks: useRef(),
        submit: useRef(),
    };

    const fetchAll = async () => {
        try {
            const [leadRes, followupsRes, areasRes, campaignsRes, allSlotsRes] = await Promise.all([
                API.get(`/leads/${id}`),
                API.get(`/followups/${id}`),
                API.get("/areas"),
                API.get("/campaigns"),
                API.get("/meeting-slots"),
            ]);

            setLead(leadRes.data);
            setFollowups(followupsRes.data);

            // Build lookup maps
            const am = {};
            areasRes.data.forEach(a => { am[a.id] = a.area_name; });
            setAreaMap(am);

            const cm = {};
            campaignsRes.data.forEach(c => { cm[c.id] = c.campaign_name ?? c.name ?? `Campaign #${c.id}`; });
            setCampaignMap(cm);

            const sm = {};
            allSlotsRes.data.forEach(s => { sm[s.id] = s.slot_name; });
            setSlotMap(sm);

            setForm((f) => ({
                ...f,
                call_status: leadRes.data.call_status || CALL_STATUSES[0]
            }));

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, [id]);

    const fetchAvailableSlots = async (date) => {
        if (!date) return;
        try {
            const res = await API.get(`/meeting-slots/available?date=${date}`);
            setSlots(res.data);
            setForm((f) => ({ ...f, meeting_slot_id: "" }));
        } catch (err) {
            console.error(err);
        }
    };

    const set = (field, value) => {
        setForm((f) => ({ ...f, [field]: value }));
        if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
    };

    const handleSelectKeyDown = (e, nextRef) => {
        if (e.key === "Enter") { e.preventDefault(); nextRef?.current?.focus(); }
    };

    const handleMeetingKeyDown = (e) => {
        if (e.key === "ArrowLeft") { e.preventDefault(); set("meeting_aligned", false); }
        if (e.key === "ArrowRight") { e.preventDefault(); set("meeting_aligned", true); }
        if (e.key === "Enter") {
            e.preventDefault();
            if (form.meeting_aligned) {
                refs.date.current?.focus();
            } else {
                refs.submit.current?.focus();
            }
        }
    };

    const validate = () => {
        const e = {};
        if (!form.call_status) e.call_status = "Call status is required";
        if (form.meeting_aligned && !form.meeting_location.trim()) e.meeting_location = "Location is required";
        if (form.meeting_aligned && !form.meeting_slot_id) e.meeting_slot_id = "Time slot is required";
        if (form.meeting_aligned && !form.meeting_date) e.meeting_date = "Meeting date required";
        if (!form.remarks.trim()) e.remarks = "Remarks required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            await API.post("/followups", {
                lead_id: Number(id),
                call_status: form.call_status,
                meeting_aligned: form.meeting_aligned,
                meeting_slot_id: form.meeting_aligned ? Number(form.meeting_slot_id) : null,
                meeting_location: form.meeting_aligned ? form.meeting_location : null,
                meeting_date: form.meeting_aligned ? form.meeting_date : null,
                remarks: form.remarks
            });
            await fetchAll();
            setForm((f) => ({ ...f, meeting_aligned: false, meeting_slot_id: "", meeting_location: "" }));
            setActiveTab("info");
        } catch (err) {
            const detail = err.response?.data?.detail;
            alert(typeof detail === "string" ? detail : JSON.stringify(detail));
        } finally {
            setSubmitting(false);
        }
    };

    const toggleBtn = (active, color = "orange") => {
        const colors = {
            orange: active ? "bg-orange-500 border-orange-500 text-white" : "bg-white border-gray-200 text-gray-600 hover:border-orange-300",
            green: active ? "bg-green-500 border-green-500 text-white" : "bg-white border-gray-200 text-gray-600 hover:border-green-300",
            gray: active ? "bg-gray-500 border-gray-500 text-white" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300",
        };
        return `flex-1 py-2 text-sm rounded-lg border transition-all font-medium focus:outline-none ${colors[color]}`;
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-gray-400">Loading lead...</span>
                </div>
            </div>
        );
    }

    if (!lead) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 font-medium">Lead not found</p>
                    <button onClick={() => navigate("/")} className="mt-3 text-orange-500 text-sm hover:underline">
                        Back to leads
                    </button>
                </div>
            </div>
        );
    }

    const systemTypeLabel = {
        ongrid: "On Grid", offgrid: "Off Grid",
        hybrid: "Hybrid", "hybrid+ongrid": "Hybrid + On Grid"
    };

    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── HEADER ── */}
            <div className="bg-white border-b border-gray-100 px-6 py-4">
                <div className="max-w-2xl mx-auto flex items-center gap-4">
                    <button
                        onClick={() => navigate("/")}
                        className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        {getInitials(lead.client_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-base font-semibold text-gray-800 truncate">{lead.client_name}</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-mono text-gray-400">{lead.contact_number}</span>
                            <span className="text-gray-200">·</span>
                            <StatusBadge status={lead.call_status} />
                        </div>
                    </div>

                    <div className="flex-shrink-0 text-center">
                        <div className="text-lg font-bold text-orange-500">{lead.followup_count || 0}</div>
                        <div className="text-xs text-gray-400">followups</div>
                    </div>
                </div>
            </div>

            {/* ── TABS ── */}
            <div className="bg-white border-b border-gray-100 px-6">
                <div className="max-w-2xl mx-auto flex">
                    {[
                        { key: "info", label: "Lead Info" },
                        { key: "followup", label: "Add Followup" },
                        { key: "history", label: `History (${followups.length})` },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === tab.key
                                ? "border-orange-500 text-orange-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-2xl mx-auto p-6">

                {/* ══ TAB: LEAD INFO ══ */}
                {activeTab === "info" && (
                    <div className="space-y-4">

                        <Card title="Telesales Agent">
    <InfoRow label="Agent Name" value={lead.telesales_agent} />
</Card>

                        <Card title="Client Information">
                            <InfoRow label="Name" value={lead.client_name} />
                            <InfoRow label="Phone" value={lead.contact_number} mono />
                            <InfoRow label="City" value={lead.city} />
                            {/* ✅ AREA NAME instead of area_id */}
                            <InfoRow label="Area" value={lead.area_id ? (areaMap[lead.area_id] || `Area #${lead.area_id}`) : null} />
                            <InfoRow label="Sub Area" value={lead.sub_area} />
                        </Card>

                        <Card title="System Details">
                            <InfoRow label="System Type" value={systemTypeLabel[lead.system_type] || lead.system_type} />
                            <InfoRow label="System Size" value={lead.system_size_kw ? `${lead.system_size_kw} KW` : null} />
                            <InfoRow label="Financing" value={lead.financing_method === "bank_financing" ? "Bank Financing" : "Cash"} />
                        </Card>

                        <Card title="Lead Source">
                            <InfoRow label="Source" value={lead.lead_source} />
                            {/* ✅ CAMPAIGN NAME instead of campaign_id */}
                            <InfoRow label="Campaign" value={lead.campaign_id ? (campaignMap[lead.campaign_id] || `Campaign #${lead.campaign_id}`) : null} />
                        </Card>

                        <Card title="Status">
                            <InfoRow label="Call Status" value={lead.call_status} />
                            <InfoRow label="Quotation ID" value={lead.quotation_id} />
                            <div className="flex items-start justify-between py-2.5 border-b border-gray-50">
                                <span className="text-xs text-gray-400 font-medium w-32 flex-shrink-0">Meeting</span>
                                <span className={`text-xs font-medium ${lead.meeting_aligned ? "text-green-600" : "text-gray-400"}`}>
                                    {lead.meeting_aligned ? "✓ Aligned" : "Not aligned"}
                                </span>
                            </div>
                            {lead.meeting_aligned && (
                                <>
                                    <InfoRow label="Location" value={lead.meeting_location} />
                                    {/* ✅ SLOT NAME instead of slot_id */}
                                    <InfoRow label="Time Slot" value={lead.meeting_slot_id ? (slotMap[lead.meeting_slot_id] || `Slot #${lead.meeting_slot_id}`) : null} />
                                </>
                            )}
                            <InfoRow label="Remarks" value={lead.remarks} />
                        </Card>

                        <button
                            onClick={() => { setActiveTab("followup"); setTimeout(() => refs.callStatus.current?.focus(), 100); }}
                            className="w-full py-3 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Followup
                        </button>

                    </div>
                )}

                {/* ══ TAB: ADD FOLLOWUP ══ */}
                {activeTab === "followup" && (
                    <form onSubmit={handleSubmit} className="space-y-4">

                        <Card title="Update Status">
                            <div className="pt-1">
                                <label className={labelClass}>Call Status *</label>
                                <select
                                    ref={refs.callStatus}
                                    className={selectClass("call_status")}
                                    value={form.call_status}
                                    onChange={(e) => set("call_status", e.target.value)}
                                    onKeyDown={(e) => handleSelectKeyDown(e, refs.meetingToggle)}
                                    autoFocus
                                >
                                    {CALL_STATUSES.map((s) => <option key={s}>{s}</option>)}
                                </select>
                                {errors.call_status && <p className={errorClass}>{errors.call_status}</p>}
                            </div>
                        </Card>

                        <Card title="Meeting">
                            <div className="pt-1 space-y-4">
                                <div>
                                    <label className={labelClass}>
                                        Meeting Aligned
                                        <span className="ml-2 font-normal text-gray-400 text-xs">(← → to switch)</span>
                                    </label>
                                    <div
                                        ref={refs.meetingToggle}
                                        tabIndex={0}
                                        className="flex gap-3 outline-none rounded-lg focus:ring-2 focus:ring-orange-300 p-0.5"
                                        onKeyDown={handleMeetingKeyDown}
                                    >
                                        <button type="button" tabIndex={-1}
                                            onClick={() => { set("meeting_aligned", false); refs.meetingToggle.current?.focus(); }}
                                            className={toggleBtn(!form.meeting_aligned, "gray")}
                                        >No</button>
                                        <button type="button" tabIndex={-1}
                                            onClick={() => { set("meeting_aligned", true); refs.meetingToggle.current?.focus(); }}
                                            className={toggleBtn(form.meeting_aligned, "green")}
                                        >Yes</button>
                                    </div>
                                </div>

                                {form.meeting_aligned && (
                                    <>
                                        <div>
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
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        refs.location.current?.focus();
                                                    }
                                                }}
                                            />
                                            {errors.meeting_date && <p className={errorClass}>{errors.meeting_date}</p>}
                                        </div>
                                        <div>
                                            <label className={labelClass}>Location *</label>
                                            <input
                                                ref={refs.location}
                                                className={inputClass("meeting_location")}
                                                placeholder="Google Maps link or lat,lng"
                                                value={form.meeting_location}
                                                onChange={(e) => set("meeting_location", e.target.value)}
                                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); refs.slot.current?.focus(); } }}
                                            />
                                            {errors.meeting_location && <p className={errorClass}>{errors.meeting_location}</p>}
                                        </div>
                                        <div>
                                            <label className={labelClass}>Time Slot *</label>
                                            <select
                                                ref={refs.slot}
                                                className={selectClass("meeting_slot_id")}
                                                value={form.meeting_slot_id}
                                                onChange={(e) => set("meeting_slot_id", e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        refs.remarks.current?.focus();
                                                    }
                                                }}
                                            >
                                                <option value="">Select Time Slot</option>
                                                {!form.meeting_date ? (
                                                    <option disabled>Select date first</option>
                                                ) : slots.length === 0 ? (
                                                    <option disabled>No slots available</option>
                                                ) : (
                                                    slots.map((slot) => (
                                                        <option key={slot.id} value={slot.id}>
                                                            {slot.slot_name} ({slot.remaining} left)
                                                        </option>
                                                    ))
                                                )}
                                            </select>
                                            {errors.meeting_slot_id && <p className={errorClass}>{errors.meeting_slot_id}</p>}
                                        </div>
                                    </>
                                )}
                            </div>
                        </Card>

                        <Card title="Remarks">
                            <div className="pt-1">
                                <label className={labelClass}>Remarks *</label>
                                <input
                                    ref={refs.remarks}
                                    className={inputClass("remarks")}
                                    placeholder="Enter remarks"
                                    value={form.remarks}
                                    onChange={(e) => set("remarks", e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            refs.submit.current?.click();
                                        }
                                    }}
                                />
                                {errors.remarks && <p className={errorClass}>{errors.remarks}</p>}
                            </div>
                        </Card>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setActiveTab("info")}
                                className="flex-1 py-3 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                ref={refs.submit}
                                type="submit"
                                disabled={submitting}
                                className="flex-1 py-3 text-sm font-semibold text-white bg-orange-500 rounded-xl hover:bg-orange-600 active:scale-95 transition-all disabled:opacity-60"
                            >
                                {submitting ? "Saving..." : "Save Followup"}
                            </button>
                        </div>

                    </form>
                )}

                {/* ══ TAB: HISTORY ══ */}
                {activeTab === "history" && (
                    <div className="space-y-3">

                        {followups.length === 0 && (
                            <div className="text-center py-12">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <p className="text-gray-500 text-sm font-medium">No followups yet</p>
                                <button
                                    onClick={() => setActiveTab("followup")}
                                    className="mt-2 text-orange-500 text-sm hover:underline"
                                >
                                    Add first followup
                                </button>
                            </div>
                        )}

                        {followups.map((f, index) => {
                            const followupNumber = followups.length - index;
                            return (
                                <div key={f.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                            {ordinal(followupNumber)} Followup
                                        </span>
                                        <span className="text-xs text-gray-400">{formatDate(f.created_at)}</span>
                                    </div>

                                    <div className="px-4 py-3 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <StatusBadge status={f.call_status} />
                                            {f.meeting_aligned && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full font-medium">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    Meeting set
                                                </span>
                                            )}
                                        </div>
                                        {f.meeting_location && (
                                            <a
                                                href={f.meeting_location.startsWith("http") ? f.meeting_location : `https://maps.google.com/?q=${f.meeting_location}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-orange-500 hover:underline flex items-center gap-1 flex-shrink-0"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                View map
                                            </a>
                                        )}
                                    </div>

                                    <div className="px-4 pb-3 space-y-1 text-xs text-gray-600">
                                        {f.meeting_date && (
                                            <div>📅 {f.meeting_date}</div>
                                        )}
                                        {/* ✅ SLOT NAME in history */}
                                        {f.meeting_slot_id && (
                                            <div>🕒 {slotMap[f.meeting_slot_id] || `Slot #${f.meeting_slot_id}`}</div>
                                        )}
                                        {f.remarks && (
                                            <div className="text-gray-700">{f.remarks}</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                    </div>
                )}

            </div>
        </div>
    );
}

function Card({ title, children }) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</h2>
            </div>
            <div className="px-4 py-1">{children}</div>
        </div>
    );
}