"use client";

import { useEffect, useState } from "react";
import { User } from "../Cosntants/constants";

const ProfileInfoForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/User`, { method: "GET" });
        const data: User = await res.json();
        setFormData({
          username: data.username || "",
          email: data.email || "",
          role: data.role || "",
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data.");
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/User`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Failed to update user.");
      }

      setSuccess(true);
    } catch (error) {
      console.error("Error updating user:", error);
      setError("Failed to update user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      <h2 className="text-lg font-bold mb-4">Edit User Info</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Username"
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
        <select
          onChange={handleChange}
          className="border p-2 rounded"
          name="role"
          id="role"
          value={formData.role}
        >
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
        </select>

        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">User updated successfully!</p>}

        <div className="flex justify-end gap-2 mt-4">
          <button type="button" className="bg-gray-300 px-4 py-2 rounded">
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
  );
};

export default ProfileInfoForm;
