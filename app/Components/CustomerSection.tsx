"use client";

import { useState } from "react";
import AddCustomer from "./AddCustomer";

const tableStyles = "px-4 py-2 border border-gray-300";

const CustomerSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="flex flex-col justify-center items-center text-center w-1/2 p-2 shadow-black bg-slate-700 rounded-lg">
        {/* Add Customer Button */}
        <div
          onClick={() => setIsOpen(true)}
          className="bg-blue-500 cursor-pointer hover:opacity-70 transition duration-200 p-2 rounded-md ml-auto mb-4"
        >
          <span className="text-white text-md">+ Add a customer</span>
        </div>

        {/* Customer Table */}
        <table className="table-auto border-collapse border border-gray-300 rounded-lg shadow-lg">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className={`${tableStyles}`}>Name</th>
              <th className={`${tableStyles}`}>Email</th>
              <th className={`${tableStyles}`}>Phone Number</th>
              <th className={`${tableStyles}`}>Description</th>
              <th className={`${tableStyles}`}>Countdown</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-gray-50 hover:bg-gray-100 transition duration-200">
              <td className={`${tableStyles}`}>John Doe</td>
              <td className={`${tableStyles}`}>john@example.com</td>
              <td className={`${tableStyles}`}>(123) 456-7890</td>
              <td className={`${tableStyles}`}>Placeholder description</td>
              <td className={`${tableStyles}`}>5 days</td>
            </tr>
            <tr className="bg-white hover:bg-gray-100 transition duration-200">
              <td className={`${tableStyles}`}>Jane Smith</td>
              <td className={`${tableStyles}`}>jane@example.com</td>
              <td className={`${tableStyles}`}>(987) 654-3210</td>
              <td className={`${tableStyles}`}>Another description</td>
              <td className={`${tableStyles}`}>3 days</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Modal for adding a customer */}
      <AddCustomer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
};

export default CustomerSection;
