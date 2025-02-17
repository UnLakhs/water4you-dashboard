"use client";

import { useCallback, useEffect, useState } from "react";
import { Customer } from "@/app/Cosntants/constants";

interface ViewCustomerProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string | null;
}

const ViewCustomer = ({ isOpen, onClose, customerId }: ViewCustomerProps) => {
  const [customer, setCustomer] = useState<Customer | null>(null);

  const fetchCustomer = useCallback(async () => {
    if (!customerId) return;

    try {
      const res = await fetch(`/api/customers/${customerId}`, {
        method: "GET",
      });
      const data = await res.json();
      setCustomer(data);
    } catch (error) {
      console.error("Error fetching customer data:", error);
    }
  }, [customerId]);

  useEffect(() => {
    if (isOpen) {
      fetchCustomer();
    }
  }, [isOpen, customerId, fetchCustomer]);

  if (!isOpen || !customer) return null;

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB"); // Format: dd/mm/yyyy
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 overflow-x-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white p-6 rounded-md shadow-lg flex flex-col gap-4 max-w-lg"
      >
        <h2 className="text-xl font-bold">{customer.name}</h2>
        <p>
          <strong>Email:</strong> {customer.email}
        </p>
        <p>
          <strong>Phone:</strong> {customer.phoneNumber}
        </p>

        {/* Updated description with scrolling */}
        <div className="flex flex-col gap-2">
          <span className="font-bold">Description: </span>
          <p className="max-h-32 overflow-y-auto p-2 border border-gray-300 rounded bg-gray-100">
            {customer.description}
          </p>
        </div>

        <p>
          <strong>Date:</strong> {customer.date}
        </p>
        <p>
          <strong>Created At:</strong> {formatDate(customer.createdAt)}
        </p>
      </div>
    </div>
  );
};

export default ViewCustomer;
