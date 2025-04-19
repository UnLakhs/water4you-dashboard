"use client";
import { useEffect, useState } from "react";

interface DeleteCustomerProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  onDeleteSuccess: () => void;
}

const DeleteCustomer = ({
  isOpen,
  onClose,
  customerId,
  onDeleteSuccess,
}: DeleteCustomerProps) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSuccess(false);
      setError(null);
    }
  }, [isOpen]);

  const handleDelete = async () => {
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      const res = await fetch(`/api/customers`, {
        method: "DELETE",
        body: JSON.stringify({ customerId }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete customer");
      }

      setSuccess(true);
      onDeleteSuccess();

      // Close the modal after a short delay to show the message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error deleting customer:", error);
      setError("An error occurred while deleting the customer.");
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
        onClick={(e) => e.stopPropagation()}
        className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center gap-4 max-w-md w-full"
      >
        <h2 className="text-lg font-bold">Are you sure?</h2>
        <p>Do you really want to delete this customer?</p>

        {success && (
          <span className="text-green-600 font-medium">
            Customer deleted successfully.
          </span>
        )}
        {error && (
          <span className="text-red-500 font-medium">{error}</span>
        )}

        <div className="flex gap-4 mt-4">
          <button
            onClick={handleDelete}
            disabled={loading || success}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            {loading ? "Deleting..." : "Yes, Delete"}
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 rounded"
          >
            No, Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCustomer;
