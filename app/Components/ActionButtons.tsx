import { FaRegTrashAlt, FaRegEdit } from "react-icons/fa";
import { CiViewList } from "react-icons/ci";

interface ActionButtonProps {
  onView: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

const ActionButtons = ({ onView, onDelete, onEdit }: ActionButtonProps) => {
  return (
    <>
      <div className="flex gap-2 mb-2">
        <button
          onClick={onView}
          className="bg-gray-500 rounded-md text-white p-2 flex gap-1 items-center cursor-pointer hover:opacity-80 transition duration-200"
        >
          <CiViewList />
          <span>View</span>
        </button>
        <button
          onClick={onEdit}
          className="bg-[#427d96] rounded-md text-white p-2 flex gap-1 items-center cursor-pointer hover:opacity-80 transition duration-200"
        >
          <FaRegEdit />
          <span>edit</span>
        </button>
      </div>
      <button onClick={onDelete} className="bg-red-500 rounded-md text-white p-2 w-fit flex gap-2 items-center justify-center text-center mx-auto cursor-pointer hover:opacity-80 transition duration-200">
        <FaRegTrashAlt />
        <span>Delete</span>
      </button>
    </>
  );
};

export default ActionButtons;