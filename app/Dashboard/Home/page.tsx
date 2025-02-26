//Utilities
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

//Components
import Nav from "@/app/Components/Nav";
import { User } from "@/app/Cosntants/constants";
import { redirect } from "next/navigation";
import CustomerSection from "@/app/Components/CustomerSection";

//Server side way to get user data from session
const getUser = async () => {
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
      <CustomerSection /> {/*I do this so that the Home page will still be a server component */}

      
    </div>
  );
};

export default Home;
