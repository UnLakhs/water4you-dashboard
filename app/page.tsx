"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const LogIn = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const maxFailedAttempts = 5;
  const lockoutDuration = 5 * 60 * 1000; // 5 minutes

  // Load failed attempts from localStorage on component mount
  useEffect(() => {
    const storedAttempts = parseInt(
      localStorage.getItem("failedAttempts") || "0"
    );
    const lockoutTime = parseInt(localStorage.getItem("lockoutTime") || "0");

    // Check if the user has exceeded the maximum failed attempts
    if (storedAttempts >= maxFailedAttempts) {
      const timeLeft = lockoutTime - Date.now(); // Calculate remaining lockout time
      // Lockout is still in effect
      if (timeLeft > 0) {
        setTimeout(() => {
          // Clear failed attempts and lockout time after the lockout duration
          localStorage.removeItem("failedAttempts");
          localStorage.removeItem("lockoutTime");
          setFailedAttempts(0); // Reset failed attempts
        }, timeLeft); // Set a timeout to clear the lockout after the remaining time
        setFailedAttempts(maxFailedAttempts); //Set failed attempts to max to disable the form
      } else {
        // Lockout has expired, clear failed attempts and lockout time
        localStorage.removeItem("failedAttempts");
        localStorage.removeItem("lockoutTime");
        setFailedAttempts(0);
      }
    } else {
      setFailedAttempts(storedAttempts); //Set failed attempts from localStorage
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.username || !formData.password) {
      setErrorMessage("All fields are required.");
      return false;
    }
    setErrorMessage("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const response = await fetch(`/api/Authentication/SignIn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        localStorage.removeItem("failedAttempts");
        localStorage.removeItem("lockoutTime");
        setSuccessMessage("Login successful! Redirecting...");
        setIsLoading(false);
        setTimeout(() => {
          router.push("/Dashboard/Home");
        }, 2000);
      } else {
        setErrorMessage("Invalid username or password.");
        setFailedAttempts((prev) => {
          const newAttempts = prev + 1;
          localStorage.setItem("failedAttempts", newAttempts.toString());

          if (newAttempts >= maxFailedAttempts) {
            localStorage.setItem(
              "lockoutTime",
              (Date.now() + lockoutDuration).toString()
            );
            setErrorMessage(
              `Too many failed attempts. Try again in 5 minutes.`
            );
          }
          return newAttempts;
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-20 items-center justify-center min-h-screen bg-[#469ea6] p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm p-6 rounded-lg bg-[#427d96] text-white shadow-lg"
      >
        <h1 className="text-center text-3xl font-bold mb-6">LOG IN</h1>
        {errorMessage && (
          <div className="mb-4 text-red-400 text-sm">{errorMessage}</div>
        )}
        {successMessage && (
          <div className="mb-4 text-green-400 text-sm">{successMessage}</div>
        )}
        <div className="mb-4">
          <label htmlFor="username" className="block text-lg mb-1">
            Username
          </label>
          <input
            type="text"
            name="username"
            id="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-2 text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={failedAttempts >= maxFailedAttempts}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-lg mb-1">
            Password
          </label>
          <input
            type="password"
            name="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={failedAttempts >= maxFailedAttempts}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          disabled={failedAttempts >= maxFailedAttempts}
        >
          {isLoading ? "Loging in..." : "Log In"}
        </button>
      </form>
    </div>
  );
};

export default LogIn;
