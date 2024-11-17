"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Menu } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <header className="container mx-auto flex items-center justify-between px-4 py-6">
      <Link href="/" className="text-2xl font-bold">
        XenoCRM.
      </Link>
      <nav className="hidden space-x-6 md:flex">
        {session ? (
          <>
            <span className="transition-colors hover:text-gray-300">
              {session.user.name}
            </span>
            <button
              onClick={() => signOut()}
              className="transition-colors hover:text-gray-300"
            >
              Logout
            </button>
          </>
        ) : (
          <Link href="login" className="transition-colors hover:text-gray-300">
            Login
          </Link>
        )}
        <Link href="/" className="transition-colors hover:text-gray-300">
          Home
        </Link>
        <Link href="orders" className="transition-colors hover:text-gray-300">
          Orders
        </Link>
        <Link href="audience" className="transition-colors hover:text-gray-300">
          Audience
        </Link>
        <Link href="campaign" className="transition-colors hover:text-gray-300">
          Campaign
        </Link>
        <Link href="messages" className="transition-colors hover:text-gray-300">
          Messages
        </Link>
      </nav>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" className="p-0 md:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-[300px] border-l border-gray-900 bg-black text-white md:hidden"
        >
          <nav className="mt-6 flex flex-col space-y-4">
            {session ? (
              <>
                <span className="text-lg transition-colors hover:text-gray-300">
                  {session.user.name}
                </span>
                <button
                  onClick={() => signOut().then(() => setIsOpen(false))}
                  className="text-lg transition-colors hover:text-gray-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="login"
                className="text-lg transition-colors hover:text-gray-300"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
            )}
            <Link
              href="/"
              className="text-lg transition-colors hover:text-gray-300"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="orders"
              className="text-lg transition-colors hover:text-gray-300"
              onClick={() => setIsOpen(false)}
            >
              Orders
            </Link>
            <Link
              href="audience"
              className="text-lg transition-colors hover:text-gray-300"
              onClick={() => setIsOpen(false)}
            >
              Audience
            </Link>
            <Link
              href="campaign"
              className="text-lg transition-colors hover:text-gray-300"
              onClick={() => setIsOpen(false)}
            >
              Campaign
            </Link>
            <Link
              href="messages"
              className="text-lg transition-colors hover:text-gray-300"
              onClick={() => setIsOpen(false)}
            >
              Messages
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
