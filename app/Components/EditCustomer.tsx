"use client";
import { Customer } from "@/app/Cosntants/constants";
import { useEffect, useState } from "react";

interface EditCustomerProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string | null;
  onEditSuccess: () => void;
}

const EditCustomer = ({
  isOpen,
  onClose,
  customerId,
  onEditSuccess,
}: EditCustomerProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    countryCode: "+30",
    localNumber: "",
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
        // Simple logic assuming phoneNumber starts with country code like "+30XXXXXXXXXX"
        const countryCodeMatch = data.phoneNumber.match(/^(\+\d{1,2})/);
        const countryCode = countryCodeMatch ? countryCodeMatch[0] : "+30";
        const localNumber = data.phoneNumber.replace(countryCode, "");

        setFormData({
          name: data.name || "",
          email: data.email || "",
          countryCode,
          localNumber,
          description: data.description || "",
          date: data.date || "",
        });

        //Reset error and success states
        setError(null);
        setSuccess(false);
        
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
      const phoneNumber = formData.countryCode + formData.localNumber;

      const response = await fetch(`/api/customers`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          ...formData,
          phoneNumber,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update customer");
      }

      setSuccess(true);
      onEditSuccess();
      // Optionally close modal after a delay or leave it open
      setTimeout(onClose, 1200);
    } catch (err) {
      console.error("Error updating customer:", err);
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
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="border p-2 rounded"
          />
          <div className="flex gap-2">
            <div className="w-1/3">
              <input
                type="text"
                name="countryCode"
                placeholder="Country Code"
                value={formData.countryCode}
                onChange={handleChange}
                className="border p-2 rounded w-full"
              />
            </div>
            <div className="w-2/3">
              <input
                type="tel"
                name="localNumber"
                placeholder="Phone Number"
                value={formData.localNumber}
                onChange={handleChange}
                className="border p-2 rounded w-full"
              />
            </div>
          </div>
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
          <div className="min-h-[24px]">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && (
              <p className="text-green-600 text-sm font-medium">
                Customer updated successfully!
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-4">
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
