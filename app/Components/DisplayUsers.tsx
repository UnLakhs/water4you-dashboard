"use client";

import { useEffect, useState } from "react";
import { User } from "../Cosntants/constants";

const tableStyles = "px-4 py-2 border border-gray-300";

const DisplayUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`/api/Users/all`, {
          method: "GET",
        });
        const data: User[] = await res.json();
        console.log(data);
        setUsers(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUsers();
  }, []);
  return (
    <table className="table-auto border-collapse border border-gray-300 rounded-lg shadow-lg w-full">
      <thead className="bg-[#427d96] text-white">
        <tr>
          <th className={`${tableStyles}`}>Name</th>
          <th className={`${tableStyles}`}>Email</th>
          <th className={`${tableStyles}`}>Role</th>
          <th className={`${tableStyles}`}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user: User) => (
          <tr
            key={user._id?.toString()}
            className="bg-white hover:bg-gray-100 transition duration-200"
          >
            <td className={`${tableStyles}`}>{user.username}</td>
            <td className={`${tableStyles}`}>{user.email}</td>
            <td className={`${tableStyles}`}>{user.role}</td>
            <td className={`${tableStyles}`}></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DisplayUsers;
