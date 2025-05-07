"use client";
import { useEffect, useState } from "react";
import { MdOutlineTextsms } from "react-icons/md";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi"; // Burger and close icons
import Link from "next/link";
import { User } from "../Cosntants/constants";
import { FaUserCircle } from "react-icons/fa";
import Image from "next/image";

const navDivStyles = `flex gap-2 cursor-pointer hover:bg-white hover:text-black transition duration-300 p-4 justify-start items-center`;

const Nav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to toggle the menu
  const [user, setUser] = useState<User | null>(null); // State to store user data

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/Authentication/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setUser(data);
        }
      } catch (error) {
        console.error("Failed to fetch user session", error);
      }
    };
    fetchUser();
  }, []);
  return (
    <nav className="bg-[#427d96] text-slate-100 sm:static lg:fixed w-full lg:w-36 lg:h-full z-10 transition-all duration-300">
      {/* Logo and burger icon */}
      <div className="flex justify-between items-center">
        {/* Logo */}
        <div className="w-full h-28 relative">
          <Link href="/Dashboard/Home">
            <Image
              src="/images/water4you-logo-removebg-preview.png"
              alt="Water4You Logo"
              fill
              className="object-cover"
            />
          </Link>
        </div>

        {/* Burger Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-white lg:hidden"
        >
          {isMenuOpen ? <HiOutlineX size={24} /> : <HiOutlineMenu size={24} />}
        </button>
      </div>

      {/* Menu Items */}
      <div
        className={`${
          isMenuOpen ? "block" : "hidden"
        } lg:block bg-[#427d96] lg:bg-transparent w-full lg:h-full transition-all duration-300`}
      >
        {user?.role === "admin" && (
          <Link href={"/Dashboard/MessageLogs"} className={`${navDivStyles}`}>
            <MdOutlineTextsms size={20} />
            <span>Logs</span>
          </Link>
        )}

        {user ? (
          <Link
            href={`/Dashboard/Profile`}
            className={`${navDivStyles} lg:mt-auto`}
          >
            <FaUserCircle size={20} />
            {/* Display the first 5 characters of the username to not mess with the icon size */}
            {user.username.length > 5 ? (
              <span>{user.username.slice(0, 5)}...</span>
            ) : (
              <span>{user.username}</span>
            )}
          </Link>
        ) : (
          <span>Loading...</span>
        )}
      </div>
    </nav>
  );
};

export default Nav;
