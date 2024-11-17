import { SessionProvider } from "next-auth/react";
import Navbar from "~/components/navbar";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SessionProvider>
      <Navbar />
      <div>{children}</div>
    </SessionProvider>
  );
}
