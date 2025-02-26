//Force dynamic rendering
export const dynamic = "force-dynamic"; 

//Utilities
import { cookies } from "next/headers";

//Components
import { redirect } from "next/navigation";
import ProfileInfoForm from "@/app/Components/ProfileInfoForm";
import { User } from "@/app/Cosntants/constants";
import CreateUserAccount from "@/app/Components/CreateUserAccount";
import DisplayUsers from "@/app/Components/DisplayUsers";


//Set the baseUrl for the API calls based on the environment
let baseUrl;

if(process.env.NODE_ENV === "development"){
  baseUrl = "http://localhost:3000";
} else {
  baseUrl = "https://water4you-dashboard.vercel.app";
}

//Server-side function to get user data from session
const getUserFromSession = async () => {
  try {
    const res = await fetch(`${baseUrl}/api/Authentication/me`, {
      method: "GET",
      headers: {
        Cookie: `token=${(await cookies()).get("token")?.value || ""}`, //send the cookies manually
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Failed to fetch user:", res.statusText);
      return null;
    }

    const data: User = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

const Profile = async () => {
  const user = await getUserFromSession();

  // If user is not logged in, redirect to login page
  if (!user) {
    redirect("/");
  }

  return (
    <div className="bg-blue-200 h-screen">
      <div className="flex flex-col gap-10 justify-center items-center">
        <div className="flex justify-between items-start ml-20 w-2/3">
          <ProfileInfoForm />

          {/* This can only be seen by users with the admin role. */}
          {user?.role === "admin" && <CreateUserAccount />}
        </div>  
        <div className="flex flex-col justify-center items-center text-center w-2/3 p-3 shadow-black rounded-lg ml-16">
          <DisplayUsers isAdmin={user?.role === "admin"} />
        </div>
      </div>
    </div>
  );
};

export default Profile;
