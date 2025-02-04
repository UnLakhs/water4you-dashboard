//Utilities
import { cookies } from "next/headers";

//Components
import Nav from "@/app/Components/Nav";
import { redirect } from "next/navigation";
import ProfileInfoForm from "@/app/Components/ProfileInfoForm";
import { User } from "@/app/Cosntants/constants";

//Server side way to get user data from session
const getUserFromSession = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  try {
    if (token) {
      const res = await fetch(`http://localhost:3000/api/User`, { method: "GET" });
      const data: User = await res.json();

      return data; // No need to return the decoded token manually anymore
    }
  } catch (error) {
    console.error("Failed to fetch user:", error);
  }
};


const Profile = async () => {
  const user = await getUserFromSession();

  //If user is not logged in, redirect to login page
  if (!user) {
    redirect("/");
  }

  return (
    <div className="bg-blue-200 h-screen">
      <Nav />
      {/* Details of user profile */}
      <div className="flex justify-between items-start ml-60">
        <ProfileInfoForm />
      </div>
        

        
      
    </div>
  );
};

export default Profile;
