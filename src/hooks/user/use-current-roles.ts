import { useSession } from "@/components/context/session-context";

export const useCurrentRoles = () => {
  const { user } = useSession();
  return user?.roles ?? [];
};
