import { redirect } from "next/navigation";
import SignClient from "./SignClient";
import { getCurrentUser } from "@/services/userService";

export default async function Page() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <SignClient />;
}
