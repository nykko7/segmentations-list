import "@/styles/globals.css";

import { Inter } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";

import { SessionProvider } from "@/components/context/session-context";
import { APP_TITLE } from "@/constants";
import { validateRequest } from "@/lib/auth/validate-request";
import { TRPCReactProvider } from "@/trpc/react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: APP_TITLE,
  description: "Segmentations List",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await validateRequest();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`theme-custom font-sans ${inter.variable}`}>
        <TRPCReactProvider>
          <SessionProvider value={session}>
            {children}
            <Toaster />
          </SessionProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
