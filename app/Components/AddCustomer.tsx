"use client";

interface AddCustomerProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddCustomer = ({ isOpen, onClose }: AddCustomerProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/20 backdrop-blur-sm flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-xl w-96"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <h1 className="text-2xl font-bold mb-4">Add Customer</h1>
        <input
          type="text"
          placeholder="Name"
          className="border p-2 w-full mb-2 rounded-md"
        />
        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-full mb-2 rounded-md"
        />
        <input
          type="text"
          placeholder="Phone Number"
          className="border p-2 w-full mb-2 rounded-md"
        />
        <textarea
          placeholder="Description"
          className="border p-2 w-full mb-2 rounded-md"
        ></textarea>
        <button className="bg-blue-500 text-white p-2 rounded-md w-full hover:bg-blue-600 transition">
          Submit
        </button>
      </div>
    </div>
  );
};

export default AddCustomer;
