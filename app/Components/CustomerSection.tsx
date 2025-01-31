"use client";

import { useEffect, useState } from "react";
import AddCustomer from "./AddCustomer";
import { Customer } from "../Cosntants/constants";
import { FaPlus } from "react-icons/fa6";
import ActionButtons from "./ActionButtons";
import ViewCustomer from "./[id]/ViewCustomer";
import DeleteCustomer from "./[id]/DeleteCustomer";
import EditCustomer from "./[id]/EditCustomer";

const tableStyles = "px-4 py-2 border border-gray-300";

const CustomerSection = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null
  );
  const [isAdding, setIsAdding] = useState(false); // Add customer modal state
  const [isEditing, setIsEditing] = useState(false); // Edit customer modal state
  const [isViewing, setIsViewing] = useState(false); // View customer modal state
  const [isDeleting, setIsDeleting] = useState(false); // Delete customer modal state

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

  return (
    <div className="flex justify-center items-center min-h-screen bg-blue-200">
      <div className="flex flex-col justify-center items-center text-center w-2/3 p-3 shadow-black bg-[#4657a2] rounded-lg ml-16">
        {/* Add Customer Button */}
        <div
          onClick={() => setIsAdding(true)}
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
              {/* <th className={`${tableStyles}`}>Description</th> */}
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
                  {/* <td className={`${tableStyles}`}>
                    <div className="max-h-20 max-w-28 overflow-y-auto">
                      <span>{customer.description}</span>
                    </div>
                  </td> */}
                  <td className={`${tableStyles}`}>{customer.date}</td>
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
      </div>

      {/* Add Customer Modal */}
      <AddCustomer isOpen={isAdding} onClose={() => setIsAdding(false)} />

      {/* View Customer Modal */}
      {selectedCustomerId && (
        <ViewCustomer
          customerId={selectedCustomerId}
          isOpen={isViewing}
          onClose={() => setIsViewing(false)}
        />
      )}

      {/* View Customer Modal */}
      {selectedCustomerId && (
        <DeleteCustomer
          customerId={selectedCustomerId}
          isOpen={isDeleting}
          onClose={() => setIsDeleting(false)}
        />
      )}

      {/* Edit Customer Modal */}
      {selectedCustomerId && (
        <EditCustomer
          customerId={selectedCustomerId}
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  );
};

export default CustomerSection;
