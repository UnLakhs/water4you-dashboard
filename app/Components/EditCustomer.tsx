"use client";
import { Customer } from "@/app/Cosntants/constants";
import { useEffect, useState } from "react";

interface EditCustomerProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string | null;
}

const EditCustomer = ({ isOpen, onClose, customerId }: EditCustomerProps) => {
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

  // Retrieve customer data when modal opens
  useEffect(() => {
    const fetchCustomer = async () => {
      if (!customerId) return;

      try {
        const res = await fetch(`/api/customers/${customerId}`);
        if (!res.ok) throw new Error("Failed to fetch customer");

        const data: Customer = await res.json();
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
          description: data.description || "",
          date: data.date || "",
        });
      } catch (error) {
        console.error("Error fetching customer data:", error);
      }
    };

    if (isOpen) {
      fetchCustomer();
    }
  }, [customerId, isOpen]);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update customer");
      }

      setSuccess(true);
      alert("Customer updated successfully");
      onClose(); // Close modal after successful update
      location.reload(); // Refresh data 
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50"
    >
      <div
        onClick={(e) => e.stopPropagation()} // Prevent background click from closing modal
        className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full"
      >
        <h2 className="text-lg font-bold mb-4">Edit Customer</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Customer Name"
            className="border p-2 rounded"
            required
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="border p-2 rounded"
            required
          />
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Phone Number"
            className="border p-2 rounded"
          />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            className="border p-2 rounded"
          />
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">Customer updated!</p>}

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCustomer;
