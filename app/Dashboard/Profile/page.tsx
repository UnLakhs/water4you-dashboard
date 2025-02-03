//Utilities
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

//Components
import Nav from "@/app/Components/Nav";
import { User } from "@/app/Cosntants/constants";
import { redirect } from "next/navigation";
import CustomerSection from "@/app/Components/CustomerSection";

//Server side way to get user data from session
const getUserIdFromSession = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  try {
    if (token && process.env.JWT_SECRET) {
      const decodedToken = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as User;
      
      const res = await fetch(`http://localhost:3000/api/User/${decodedToken.id}`, {method: "GET"});
      const data = await res.json();
      console.log(data);

      return decodedToken;
    }
  } catch (error) {
    console.error("Failed to decode token:", error);
  }
};

const Profile = async () => {
  const user = await getUserIdFromSession();

  //If user is not logged in, redirect to login page
  if (!user) {
    redirect("/");
  }

  return (
    <div>
      <Nav />
      {/* Details of user profile */}
      <div className="flex flex-col items-center justify-center h-screen bg-blue-200">
        

        
      </div>
    </div>
  );
};

export default Profile;
