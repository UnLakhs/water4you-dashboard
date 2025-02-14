"use client";

import { FaRegTrashAlt } from "react-icons/fa";
import { useEffect, useState } from "react";
import { User } from "../Cosntants/constants";
import DeleteUser from "./DeleteUser";

const tableStyles = "px-4 py-2 border border-gray-300";

/**
 * @description Interface for the component's props.
 * @property {boolean} isAdmin - Indicates whether the user is an admin.
 */

interface DisplayUsersProps {
  isAdmin: boolean;
}

const DisplayUsers = ({ isAdmin }: DisplayUsersProps) => {
  /**
   * @description Component to display a table of users, with delete functionality for admins.
   * @param {DisplayUsersProps} { isAdmin } - Props for the component.
   * @returns {JSX.Element} - The rendered table of users.
   */

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Client-side fetch function
  /**
   * @description Fetches user data from the API endpoint.
   */
  const fetchUsers = async () => {
    try {
      const res = await fetch(`/api/Users/all`); // Use relative URL
      if (!res.ok) throw new Error("Failed to fetch users");

      const data: User[] = await res.json();
      setUsers(data); // Update state with fetched users
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Fetch users when component mounts
  /**
   * @description useEffect hook to fetch user data when the component mounts.
   */
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <>
      <table className="table-auto border-collapse border border-gray-300 rounded-lg shadow-lg w-full">
        <thead className="bg-[#427d96] text-white">
          <tr>
            <th className={`${tableStyles}`}>Name</th>
            <th className={`${tableStyles}`}>Email</th>
            <th className={`${tableStyles}`}>Role</th>
            {/* Conditionally render the "Actions" column only for admins */}
            {isAdmin && <th className={`${tableStyles}`}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {users.map((user: User) => (
            <tr
              key={user._id.toString()}
              className="bg-white hover:bg-gray-100 transition duration-200"
            >
              <td className={`${tableStyles}`}>{user.username}</td>
              <td className={`${tableStyles}`}>{user.email}</td>
              <td className={`${tableStyles}`}>{user.role}</td>
              {/* Conditionally render the delete button only for admins */}
              {isAdmin && (
                <td className={`${tableStyles}`}>
                  <div
                    onClick={() => {
                      setSelectedUserId(user._id.toString()); // Set the selected user
                      setIsDeleting(true); // Open the delete confirmation modal
                    }}
                    className="bg-red-500 text-white px-3 py-1 mx-auto rounded flex items-center gap-1 w-fit cursor-pointer hover:bg-red-600 transition duration-200"
                  >
                    <FaRegTrashAlt />
                    <span>Delete</span>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Conditionally render the DeleteUser modal only when a user is selected */}
      {selectedUserId && (
        <DeleteUser
          userId={selectedUserId}
          isOpen={isDeleting}
          onClose={async () => {
            setIsDeleting(false); // Close the delete modal
            setSelectedUserId(null); // Reset the selected user
            fetchUsers(); // refresh user list after deletion
          }}
        />
      )}
    </>
  );
};

export default DisplayUsers;
