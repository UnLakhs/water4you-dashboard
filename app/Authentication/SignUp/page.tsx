"use client";
import { useState } from "react";
import Link from "next/link";
import { inputStyles } from "@/app/Cosntants/constants";

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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

      alert("Your account has been created successfully! Redirecting to the login page...");
      window.location.href = "/Authentication/SignIn";
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("An error occurred. Please try again.");
    }
  };
  return (
    <div className="flex flex-col justify-center items-center text-center bg-[#469ea6] h-screen">
      <form
        onSubmit={handleSubmit}
        className="p-8 flex flex-col gap-2 rounded-md bg-[#427d96] text-slate-100"
      >
        <h1 className="text-4xl font-bold mb-10">Sign Up</h1>
        {errorMessage && (
          <div className="mb-4 text-red-500">{errorMessage}</div>
        )}
        <div className="mb-4">
          <label htmlFor="username" className="block font-bold mb-2">
            Username:
          </label>
          <input
            type="text"
            name="username"
            placeholder="Username"
            className={inputStyles}
            value={formData.username}
            onChange={handleChange}
            autoComplete="off"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block font-bold mb-2">
            Email:
          </label>
          <input
            type="email"
            name="email"
            placeholder="Email"
            className={inputStyles}
            value={formData.email}
            onChange={handleChange}
            autoComplete="off"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block font-bold mb-2">
            Password:
          </label>
          <input
            type="password"
            name="password"
            placeholder="Password"
            className={inputStyles}
            value={formData.password}
            onChange={handleChange}
            autoComplete="off"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Sign Up
        </button>
      </form>
      <div className="p-2 rounded-md hover:opacity-80 transition duration-200 mt-4 bg-blue-700">
        <Link className="font-bold" href={`/`}>
          Already have an account? Log in!
        </Link>
      </div>
    </div>
  );
};

export default SignUp;
