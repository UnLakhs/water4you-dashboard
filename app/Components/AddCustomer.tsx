"use client";

import { useState } from "react";

const inputStyles = `text-black shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline`;

interface AddCustomerProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddCustomer = ({ isOpen, onClose }: AddCustomerProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    countryCode: "+30", // New field for country code
    localNumber: "", // Changed from phoneNumber
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
      const phoneNumber = formData.countryCode + formData.localNumber; // Combine country code and local number
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({...formData, phoneNumber}),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setFormData({
          name: "",
          email: "",
          countryCode: "+30",
          localNumber: "",
          description: "",
          date: "",
        });
        location.reload();
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
        <div className="flex gap-2">
          <div className="w-1/3">
            <input
              type="text"
              name="countryCode"
              placeholder="Country Code"
              value={formData.countryCode}
              onChange={handleChange}
              className={inputStyles}
            />
          </div>
          <div className="w-2/3">
            <input
              type="text"
              name="localNumber"
              placeholder="Phone Number"
              value={formData.localNumber}
              onChange={handleChange}
              className={inputStyles}
            />
          </div>
        </div>
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
