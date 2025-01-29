"use client";

import { useState } from "react";
import { inputStyles } from "../Cosntants/constants";

interface AddCustomerProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddCustomer = ({ isOpen, onClose }: AddCustomerProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    description: "",
    date: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setFormData({
          name: "",
          email: "",
          phoneNumber: "",
          description: "",
          date: "",
        });
      } else {
        setError(data.error || "Failed to add customer");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-md flex justify-center items-center z-50"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white flex flex-col gap-2 p-6 rounded-lg shadow-xl w-96 relative"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <h1 className="text-2xl font-bold mb-4">Add Customer</h1>

        {success && (
          <p className="text-green-600 mb-2">Customer added successfully!</p>
        )}
        {error && <p className="text-red-600 mb-2">{error}</p>}

        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          className={inputStyles}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className={inputStyles}
        />
        <input
          type="text"
          name="phoneNumber"
          placeholder="Phone Number"
          value={formData.phoneNumber}
          onChange={handleChange}
          className={inputStyles}
        />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className={inputStyles}
        />
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className={inputStyles}
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white p-2 rounded-md w-full hover:bg-blue-600 transition disabled:bg-gray-400"
        >
          {loading ? "Adding..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default AddCustomer;
