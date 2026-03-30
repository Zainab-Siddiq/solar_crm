// src/components/FollowupForm.jsx

import { useState } from "react";
import { API } from "../api/api";

export default function FollowupForm({ leadId }) {
  const [status, setStatus] = useState("");

  const handleSubmit = async () => {
    await API.post("/followups", {
      lead_id: leadId,
      call_status: status
    });

    alert("Followup Added");
  };

  return (
    <div>
      <input
        placeholder="Call Status"
        onChange={(e) => setStatus(e.target.value)}
      />

      <button onClick={handleSubmit}>Add Followup</button>
    </div>
  );
}