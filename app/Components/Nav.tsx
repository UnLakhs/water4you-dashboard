"use client";
import { useEffect, useState } from "react";
import { MdOutlineTextsms } from "react-icons/md";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi"; // Burger and close icons
import { CiLogin } from "react-icons/ci";
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
        const response = await fetch(`/api/Authentication/Session`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
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
      <div className="flex justify-between items-center p-4">
        {/* Logo */}
        <Link href={"/Dashboard/Home"}>
          <Image
            src="/images/vecteezy_drop-of-water_20967303.png"
            alt="Droplet image"
            width={20}
            height={20}
            className="object-cover"
          />
        </Link>
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
        } lg:block bg-[#0f1925] lg:bg-transparent w-full lg:h-full transition-all duration-300`}
      >
        <Link href={"/"} className={`${navDivStyles}`}>
          <MdOutlineTextsms size={20} />
          <span>SMS Logs</span>
        </Link>
        {user ? (
          <Link
            href={`/Dashboard/Profile`}
            className={`${navDivStyles} lg:mt-auto`}
          >
            <FaUserCircle size={20} />
            <span>{user.username}</span>
          </Link>
        ) : (
          <span>Loading...</span>
        )}
      </div>
    </nav>
  );
};

export default Nav;
