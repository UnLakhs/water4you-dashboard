"use client";

import { useEffect, useState } from "react";
import AddCustomer from "./AddCustomer";
import { Customer } from "../Cosntants/constants";
import { FaPlus } from "react-icons/fa6";
import ActionButtons from "./ActionButtons";

const tableStyles = "px-4 py-2 border border-gray-300";

const CustomerSection = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch("/api/customers");
        const data: Customer[] = await response.json();
        setCustomers(data);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
    fetchCustomers();
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex justify-center items-center min-h-screen bg-blue-200">
      <div className="flex flex-col justify-center items-center text-center w-2/3 p-3 shadow-black bg-[#4657a2] rounded-lg">
        {/* Add Customer Button */}
        <div
          onClick={() => setIsOpen(true)}
          className="bg-[#427d96] cursor-pointer hover:opacity-70 transition duration-200 p-2 rounded-md ml-auto mb-4"
        >
          <div className="flex gap-1 text-white items-center">
            <FaPlus />
            <span className="text-md">Add a customer</span>
          </div>
        </div>

        {/* Customer Table */}
        <table className="table-auto border-collapse border border-gray-300 rounded-lg shadow-lg">
          <thead className="bg-[#427d96] text-white">
            <tr>
              <th className={`${tableStyles}`}>Name</th>
              <th className={`${tableStyles}`}>Email</th>
              <th className={`${tableStyles}`}>Phone Number</th>
              <th className={`${tableStyles}`}>Description</th>
              <th className={`${tableStyles}`}>Countdown</th>
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
                  <td className={`${tableStyles}`}>{customer.email}</td>
                  <td className={`${tableStyles}`}>{customer.phoneNumber}</td>
                  <td className={`${tableStyles}`}>{customer.description}</td>
                  <td className={`${tableStyles}`}>{customer.date}</td>
                  <td className={`${tableStyles}`}>
                    <ActionButtons />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center text-white text-lg py-4">
                  No customers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for adding a customer */}
      <AddCustomer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
};

export default CustomerSection;
