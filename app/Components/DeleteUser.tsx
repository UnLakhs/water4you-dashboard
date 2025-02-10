"use client";

import { useState } from "react";
import { User } from "../Cosntants/constants";

interface DeleteUserProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const DeleteUser = ({ userId, isOpen, onClose }: DeleteUserProps) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);

    try {
      const res = await fetch(`/api/Users`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete User");
      }

      alert("User was deleted successfully");
      onClose(); // Close the modal after deletion
    } catch (error) {
      console.error("Error deleting customer:", error);
      alert("Error deleting customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose} // Close modal when clicking outside
      className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50"
    >
      <div
        onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
        className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center gap-4 max-w-md"
      >
        <h2 className="text-lg font-bold">Are you sure?</h2>
        <p>Do you really want to delete this customer?</p>
        <div className="flex gap-4 mt-4">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            {loading ? "Deleting..." : "Yes, Delete"}
          </button>
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">
            No, Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteUser;
