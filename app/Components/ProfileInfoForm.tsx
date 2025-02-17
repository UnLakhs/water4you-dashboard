"use client";

import { useEffect, useState } from "react";
import { User } from "../Cosntants/constants";
import ChangeUserPassword from "./ChangeUserPassword";
import { useRouter } from "next/navigation";

const ProfileInfoForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const router = useRouter();

  const [isChanging, setIsChanging] = useState(false); // Change password modal

  //Fetch user details when component mounts
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/Users`, {
          method: "GET",
          credentials: "include",
        });
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { role, ...formDataWithoutRole } = formData; // Remove 'role' from submit payload to prevent user from changing it from inspect

      const res = await fetch(`/api/Users`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formDataWithoutRole),
      });

      if (!res.ok) {
        throw new Error("Failed to update user.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      console.error("Error updating user:", error);
      setError("Failed to update user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mt-12">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <h2 className="text-4xl font-bold mb-2">Edit User Info</h2>
        {/* Error and Success messages */}
        {error && <div className="mb-4 text-red-500">{error}</div>}
        {success && (
          <div className="mb-4 text-green-500">
            User account was created successfully!
          </div>
        )}

        {/* Username  */}
        <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
          <label className="font-semibold text-lg" htmlFor="username">
            Username:
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            className="border p-2 rounded w-full"
            required
          />
        </div>

        {/* Email */}
        <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
          <label className="font-semibold text-lg" htmlFor="email">
            Email:
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="border p-2 rounded w-full"
            required
          />
        </div>

        {/* Role */}
        <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
          <label className="font-semibold text-lg" htmlFor="role">
            Role:
          </label>
          <input
            type="text"
            name="role"
            id="role"
            value={formData.role}
            disabled
            className="border p-2 rounded w-full bg-gray-300"
          />
        </div>

        {/* Change password and Submit buttons */}
        <div className="flex justify-between gap-2 mt-4">
          <button
            onClick={() => setIsChanging(true)}
            className="bg-gray-300 px-4 py-2 hover:opacity-70 transition duration-200 rounded"
            type="button"
          >
            Change Password
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
      {/* Conditionally render ChangeUserPassword */}
      {isChanging && (
        <ChangeUserPassword
          isOpen={isChanging}
          onClose={() => setIsChanging(false)}
        />
      )}
    </div>
  );
};

export default ProfileInfoForm;
