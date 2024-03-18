import { useSession } from "@/components/context/session-context";

export const useCurrentUser = () => {
  const { user } = useSession();

  return user;
};
