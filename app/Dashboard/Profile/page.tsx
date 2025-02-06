//Utilities
import { cookies } from "next/headers";

//Components
import Nav from "@/app/Components/Nav";
import { redirect } from "next/navigation";
import ProfileInfoForm from "@/app/Components/ProfileInfoForm";
import Link from "next/link";
import { User } from "@/app/Cosntants/constants";
import CreateUserAccount from "@/app/Components/CreateUserAccount";

//Server-side function to get user data from session
const getUserFromSession = async () => {
  try {
    const res = await fetch(`http://localhost:3000/api/Authentication/me`, {
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
      <Nav />
      <div className="flex gap-56 items-start ml-60">
        <ProfileInfoForm />

        {/* This can only be seen by users with the admin role. */}
        {user?.role === "admin" && (
          <CreateUserAccount />
        )}
      </div>
    </div>
  );
};

export default Profile;
