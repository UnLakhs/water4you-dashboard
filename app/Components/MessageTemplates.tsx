// app/Components/MessageTemplates.tsx
"use client";

import { useState, useEffect } from "react";
import { FaSave, FaSms, FaEnvelope } from "react-icons/fa";
import { NotificationTemplates } from "../Cosntants/constants";

// Define the TemplateState type based on NotificationTemplates interface
// This ensures our component state matches the expected API response structure
type TemplateState = {
  sms: NotificationTemplates["smsTemplate"];
  email: NotificationTemplates["emailTemplate"];
};

const MessageTemplates = () => {
  const [templates, setTemplates] = useState<TemplateState>({
    sms: { body: "" },
    email: { subject: "", htmlContent: "" },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Fetches templates from the API endpoint
   * Updates component state with fetched templates
   * Handles loading state and errors
   */
  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/message-templates");

      const data = await res.json();

      setTemplates({
        sms: { body: data.sms.body },
        email: {
          subject: data.email.subject,
          htmlContent: data.email.htmlContent,
        },
      });
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false); // Reset loading state regardless of success/failure
    }
  };

  /**
   * Saves the current templates to the API
   * Handles saving state and success/error feedback
   */
  const saveTemplates = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/message-templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templates),
      });

      if (!res.ok) throw new Error("Save failed");
      alert("Templates saved!");

      await fetchTemplates(); // Refresh templates after successful save
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save templates");
    } finally {
      setIsSaving(false); // Reset saving state regardless of success/failure
    }
  };

  // Fetch templates when component mounts
  useEffect(() => {
    fetchTemplates();
  }, []);

  // Show loading spinner while data is being fetched
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Message Templates
      </h2>

      {/* SMS Template Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3 text-blue-600">
          <FaSms size={18} />
          <h3 className="text-lg font-semibold">SMS Template</h3>
        </div>
        <textarea
          className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          value={templates.sms.body}
          onChange={(e) =>
            setTemplates({
              ...templates,
              sms: { ...templates.sms, body: e.target.value },
            })
          }
        />
        <p className="text-sm text-gray-500 mt-2">
          Available variables: {"{{name}}"}, {"{{dueDate15Days}}"}, {"{{product_url}}"}
        </p>
      </div>

      {/* Email Template Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3 text-blue-600">
          <FaEnvelope size={18} />
          <h3 className="text-lg font-semibold">Email Template</h3>
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-medium">Subject:</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-md"
            value={templates.email.subject}
            onChange={(e) =>
              setTemplates({
                ...templates,
                email: { ...templates.email, subject: e.target.value },
              })
            }
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-medium">HTML Content:</label>
          <textarea
            className="w-full h-64 p-3 border border-gray-300 rounded-md font-mono text-sm"
            value={templates.email.htmlContent}
            onChange={(e) =>
              setTemplates({
                ...templates,
                email: { ...templates.email, htmlContent: e.target.value },
              })
            }
          />
        </div>
        <p className="text-sm text-gray-500">
        Available variables: {"{{name}}"}, {"{{dueDate15Days}}"}, {"{{product_url}}"}
        </p>
      </div>

      <button
        onClick={saveTemplates}
        disabled={isSaving}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
      >
        <FaSave />
        {isSaving ? "Saving..." : "Save Templates"}
      </button>
    </div>
  );
};

export default MessageTemplates;
