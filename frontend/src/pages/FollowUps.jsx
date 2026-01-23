import React, { useState } from "react";
import LeadForm from "../components/leads/LeadForm";
import leadService from "../services/leadService";

const FollowUps = () => {
  const [editingLead, setEditingLead] = useState(null);
  const [view, setView] = useState("create");

  const handleCreateLead = async (leadData) => {
    try {
      await leadService.createLead(leadData);
      alert("Lead added successfully");
    } catch (err) {
      console.error("Error creating lead:", err);
      alert("Failed to create lead");
    }
  };

  const handleUpdateLead = async (leadData) => {
    try {
      await leadService.updateLead(leadData._id, leadData);
      alert("Lead updated successfully");
    } catch (err) {
      console.error("Error updating lead:", err);
      alert("Failed to update lead");
    }
  };

  const handleCancelForm = () => {
    console.log("Cancelled");
  };

  return (
    <div>
      <LeadForm
        key={editingLead ? editingLead._id : "new"}
        initialData={editingLead}
        onSubmit={view === "create" ? handleCreateLead : handleUpdateLead}
        onCancel={handleCancelForm}
      />{" "}
    </div>
  );
};

export default FollowUps;
