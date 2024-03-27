import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

const AuthLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await getCurrentUser();

  if (user) {
    redirect("/");
  }

  return (
    <div className="bg- flex h-screen flex-col items-center justify-center">
      {children}
    </div>
  );
};

export default AuthLayout;
