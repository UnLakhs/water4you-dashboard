//Utilities
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

//Components
import Nav from "@/app/Components/Nav";
import { User } from "@/app/Cosntants/constants";
import { redirect } from "next/navigation";

const tableStyles = "px-4 py-2 border border-gray-300";

//Server side way to get user data from session
const getUser = async () => {
  // const JWT_SECRET = process.env.JWT_SECRET;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  try {
    if (token && process.env.JWT_SECRET) {
      const decodedToken = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as User;
      return decodedToken;
    }
  } catch (error) {
    console.error("Failed to decode token:", error);
  }
};

const Home = async () => {
  const user = await getUser();

  //If user is not logged in, redirect to login page
  if (!user) {
    redirect("/");
  }

  return (
    <div>
      <Nav />
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
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
    </div>
  );
};

export default Home;
