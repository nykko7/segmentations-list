"use client";
import { type validateRequest } from "@/lib/auth/validate-request";
import { createContext, useContext } from "react";

type ContextType = Awaited<ReturnType<typeof validateRequest>>;

const SessionContext = createContext<ContextType>({
  session: null,
  user: null,
});

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};

export const SessionProvider = ({
  children,
  value,
}: {
  children: React.ReactNode;
  value: ContextType;
}) => {
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};

// export const SessionProvider = SessionContext.Provider;
