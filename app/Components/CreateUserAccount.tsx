"use client";
import { useState } from "react";

/**
 * @description This component renders a form for creating a new user account.
 * It handles form submission, validation, and communication with the backend API.
 */

const CreateUserAccount = () => {
  /**
   * @description State variables for the form data, error messages, loading state, and success state.
   */

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  /**
   * @description Handles changes to the input fields, updating the formData state.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  /**
   * @description Validates the form data before submission.
   * Checks for empty fields and valid email format.
   * @returns {boolean} - True if the form is valid, false otherwise.
   */
  const validateForm = () => {
    const { username, email, password } = formData;
    if (!username || !email || !password) {
      setErrorMessage("All fields are required.");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return false;
    }
    setErrorMessage("");
    return true;
  };

  /**
   * @description Handles the form submission.
   * Sends a POST request to the backend API to create a new user account.
   * @param {React.FormEvent<HTMLFormElement>} e - The form submit event.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccess(false);

    if (!validateForm()) return;

    try {
      const response = await fetch(`/api/Authentication/SignUp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      await response.json();
      setSuccess(true);
      // location.reload();
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mt-12">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3"
      >
        <h2 className="text-4xl font-bold mb-2">Create Staff Account</h2>
        {errorMessage && (
          <div className="mb-4 text-red-500">{errorMessage}</div>
        )}
        {success && (
          <div className="mb-4 text-green-500">
            User account was created successfully!
          </div>
        )}

        {/* Username */}
        <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
          <label htmlFor="staff-username" className="font-semibold text-lg">
            Username:
          </label>
          <input
            type="text"
            name="username"
            id="staff-username"
            placeholder="Username"
            className="border p-2 rounded w-full"
            value={formData.username}
            onChange={handleChange}
            autoComplete="off"
            required
          />
        </div>

        {/* Email */}
        <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
          <label htmlFor="staff-email" className="font-semibold text-lg">
            Email:
          </label>
          <input
            type="email"
            name="email"
            id="staff-email"
            placeholder="Email"
            className="border p-2 rounded w-full"
            value={formData.email}
            onChange={handleChange}
            autoComplete="off"
            required
          />
        </div>
        {/* Password */}
        <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
          <label htmlFor="staff-password" className="font-semibold text-lg">
            Password:
          </label>
          <input
            type="password"
            name="password"
            id="staff-password"
            placeholder="Password"
            className="border p-2 rounded w-full"
            value={formData.password}
            onChange={handleChange}
            autoComplete="off"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {loading ? "Creating..." : "Create Staff Account"}
        </button>
      </form>
    </div>
  );
};

export default CreateUserAccount;
