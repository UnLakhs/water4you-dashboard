"use client";
import { useState } from "react";
import Link from "next/link";

const LogIn = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const validateForm = () => {
    const { username, password } = formData;
    if (!username || !password) {
      setErrorMessage("All fields are required.");
      return false;
    }
    setErrorMessage("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const response = await fetch(`/api/Authentication/SignIn`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        alert("User logged in successfully!");
        window.location.href = "/Dashboard/Home";
      } else {
        setErrorMessage(result.error || "User creation failed.");
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("An error occurred. Please try again.");
    }
  };
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#469ea6]">
      <form
        onSubmit={handleSubmit}
        className="p-8 flex flex-col gap-2 rounded-md bg-[#427d96] text-slate-100"
      >
        <h1 className="text-center text-3xl font-bold mb-6 text-white">
          LOG IN
        </h1>
        {/* error messages */}
        {errorMessage && (
          <div className="mb-4 text-red-500">{errorMessage}</div>
        )}
        {/* Username */}
        <div className="flex flex-row items-center justify-between gap-4">
          <label htmlFor="username">Username: </label>
          <input
            type="text"
            name="username"
            id="username"
            value={formData.username}
            onChange={handleChange}
            className="rounded-md py-1 text-black"
          />
        </div>
        {/* Password */}
        <div className="flex flex-row items-center justify-between gap-4">
          <label htmlFor="password">Password: </label>
          <input
            type="password"
            name="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            className="rounded-md py-1 text-black"
          />
        </div>
        {/* Submit */}
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 transition duration-200 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
        >
          Log in
        </button>
      </form>

      <div>
        <Link href="/Authentication/SignUp">
          Don&apos;t have an account? Sign Up
        </Link>
      </div>
    </div>
  );
};

export default LogIn;
