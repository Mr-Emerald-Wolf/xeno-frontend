import { SessionProvider } from "next-auth/react";
import Navbar from "~/components/navbar";
import { ToastProvider } from "~/components/ui/toast";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SessionProvider>
      <ToastProvider>
        <Navbar />
        <div>{children}</div>
      </ToastProvider>
    </SessionProvider>
  );
}
