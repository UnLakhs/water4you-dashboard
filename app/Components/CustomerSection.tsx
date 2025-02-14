"use client";

import { useEffect, useState } from "react";
import AddCustomer from "./AddCustomer";
import { Customer } from "../Cosntants/constants";
import { FaPlus } from "react-icons/fa6";
import { CiSearch } from "react-icons/ci";
import ActionButtons from "./ActionButtons";
import ViewCustomer from "./ViewCustomer";
import DeleteCustomer from "./DeleteCustomer";
import EditCustomer from "./EditCustomer";

const tableStyles = "px-4 py-2 border border-gray-300";

const computeCountdown = (targetDateStr: string): string => {
  const today = new Date();
  const targetDate = new Date(targetDateStr);

  // Calculate difference in milliseconds
  const diffTime = targetDate.getTime() - today.getTime();
  // Calculate difference in days (round up so even partial days count as a full day)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    return `${diffDays} days`;
  } else if (diffDays === 0) {
    return "Due today";
  } else {
    return `${Math.abs(diffDays)} days overdue`;
  }
};

const CustomerSection = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20; // Customers per page

  // New states for search and sort
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // States for modals and selected customer
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null
  );
  const [isAdding, setIsAdding] = useState(false); // Add customer modal state
  const [isEditing, setIsEditing] = useState(false); // Edit customer modal state
  const [isViewing, setIsViewing] = useState(false); // View customer modal state
  const [isDeleting, setIsDeleting] = useState(false); // Delete customer modal state

  const fetchCustomers = async () => {
    // Include search and order query parameters in the URL.
    const res = await fetch(
      `/api/customers?page=${currentPage}&limit=${limit}&search=${encodeURIComponent(
        searchTerm
      )}&order=${sortOrder}`
    );
    const data = await res.json();
    setCustomers(data.customers);
    setTotalPages(data.totalPages);
  };

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, searchTerm, sortOrder]);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Handler to toggle sort order when clicking the "Countdown" column header.
  const handleSortToggle = () => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-blue-200">
      <div className="flex flex-col justify-center items-center text-center w-2/3 p-3 shadow-black bg-[#4657a2] rounded-lg ml-16">
        {/* Top bar with search input and "Add a customer" button */}
        <div className="flex justify-between items-center w-full mb-4">
          {/* Search Bar */}
          <div className="flex items-center justify-between gap-2 w-1/3 bg-white border p-2 rounded">
            <input
              type="text"
              placeholder="Search customers..."
              className="w-full outline-none text-black"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                // Reset to first page when search changes
                setCurrentPage(1);
              }}
            />
            <CiSearch className="text-black" />
          </div>
          {/* Add Customer Button */}
          <div
            onClick={() => setIsAdding(true)}
            className="bg-[#427d96] cursor-pointer hover:opacity-70 transition duration-200 p-2 rounded-md"
          >
            <div className="flex gap-1 text-white items-center">
              <FaPlus />
              <span className="text-md">Add a customer</span>
            </div>
          </div>
        </div>

        {/* Customer Table */}
        <table className="table-auto border-collapse border border-gray-300 rounded-lg shadow-lg w-full">
          <thead className="bg-[#427d96] text-white">
            <tr>
              <th className={`${tableStyles}`}>Name</th>
              <th className={`${tableStyles}`}>Email</th>
              <th className={`${tableStyles}`}>Phone Number</th>
              <th
                className={`${tableStyles} cursor-pointer hover:bg-blue-500 transition duration-200`}
                onClick={handleSortToggle}
              >
                {/* You can rename this column as desired */}
                Due Date & Countdown {sortOrder === "asc" ? "↑" : "↓"}
              </th>
              <th className={`${tableStyles}`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.length > 0 ? (
              customers.map((customer) => (
                <tr
                  key={customer._id?.toString()}
                  className="bg-white hover:bg-gray-100 transition duration-200"
                >
                  <td className={`${tableStyles}`}>{customer.name}</td>
                  <td className={`${tableStyles}`}>{customer.email || "-"}</td>
                  <td className={`${tableStyles}`}>
                    {customer.phoneNumber || "-"}
                  </td>
                  <td className={`${tableStyles}`}>
                    {customer.date} <br />
                    <span className="text-sm text-gray-600">
                      ({computeCountdown(customer.date)})
                    </span>
                  </td>
                  <td className={`${tableStyles}`}>
                    <ActionButtons
                      onView={() => {
                        setSelectedCustomerId(customer._id?.toString() || null);
                        setIsViewing(true);
                      }}
                      onEdit={() => {
                        setSelectedCustomerId(customer._id?.toString() || null);
                        setIsEditing(true);
                      }}
                      onDelete={() => {
                        setSelectedCustomerId(customer._id?.toString() || null);
                        setIsDeleting(true);
                      }}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center text-white text-lg py-4">
                  No customers found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="text-white mt-4">
          <button disabled={currentPage === 1} onClick={prevPage}>
            {"<"}
          </button>
          <span className="mx-2">
            Page {currentPage} of {totalPages}
          </span>
          <button disabled={currentPage === totalPages} onClick={nextPage}>
            {">"}
          </button>
        </div>
      </div>

      {/* Modals */}
      <AddCustomer isOpen={isAdding} onClose={() => setIsAdding(false)} />

      {selectedCustomerId && (
        <ViewCustomer
          customerId={selectedCustomerId}
          isOpen={isViewing}
          onClose={() => setIsViewing(false)}
        />
      )}

      {selectedCustomerId && (
        <DeleteCustomer
          customerId={selectedCustomerId}
          isOpen={isDeleting}
          onClose={() => setIsDeleting(false)}
          onDeleteSuccess={fetchCustomers}
        />
      )}

      {selectedCustomerId && (
        <EditCustomer
          customerId={selectedCustomerId}
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          onEditSuccess={fetchCustomers}
        />
      )}
    </div>
  );
};

export default CustomerSection;
