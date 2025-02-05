//Utilities
import { cookies } from "next/headers";

//Components
import Nav from "@/app/Components/Nav";
import { redirect } from "next/navigation";
import ProfileInfoForm from "@/app/Components/ProfileInfoForm";
import Link from "next/link";
import { User } from "@/app/Cosntants/constants";

//Server-side function to get user data from session
const getUserFromSession = async () => {
  try {
    const res = await fetch(`http://localhost:3000/api/Authentication/me`, {
      method: "GET",
      headers: {
        Cookie: `token=${(await cookies()).get("token")?.value || ""}`,
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
      <div className="flex justify-between items-start ml-60">
        <ProfileInfoForm />

        {/* This can only be seen by users with the admin role. */}
        {user?.role === "admin" && (
          <Link
            href={"/Authentication/SignUp"}
            className="bg-blue-500 p-4 rounded-md text-white text-center m-auto hover:bg-blue-600 transition duration-200"
          >
            Make an account for a user
          </Link>
        )}
      </div>
    </div>
  );
};

export default Profile;
