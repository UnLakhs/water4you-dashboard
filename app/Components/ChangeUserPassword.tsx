"use client";

import { useEffect, useState } from "react";
import { User } from "../Cosntants/constants";
import { useRouter } from "next/navigation";

interface ChangeUserPasswordProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangeUserPassword = ({ isOpen, onClose }: ChangeUserPasswordProps) => {

    const router = useRouter();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
        try {
            const res = await fetch(`/api/Users`, {
            method: "GET",
            credentials: "include",
            });
            const data: User = await res.json();
            setUser(data);
        } catch (error) {
            console.error("Error fetching user data:", error);
            setError("Failed to load user data.");
        }
    }
    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
  
    try {
      const userId = user?._id; //Pass the id like that to the backend
      const { currentPassword, newPassword, confirmPassword } = formData;
      
      if (newPassword !== confirmPassword) {
        throw new Error("Passwords do not match");
      }
  
      const res = await fetch(`/api/Users/ChangePassword`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, currentPassword, newPassword }),
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update password");
      }
      
      setSuccess(true);

      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      console.error("Error updating password:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  if(!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50"
    >
      <div
        onClick={(e) => e.stopPropagation()} // Prevent background click from closing modal
        className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full"
      >
        <h2 className="text-lg font-bold mb-4">Change Password</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            placeholder="Current Password"
            className="border p-2 rounded"
            required
          />
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            placeholder="New Password"
            className="border p-2 rounded"
            required
          />
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm Password"
            className="border p-2 rounded"
          />

          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">User password changed!</p>}

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              {loading ? "Changing..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangeUserPassword;
