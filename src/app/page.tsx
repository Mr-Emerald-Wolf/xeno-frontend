import { SessionProvider } from "next-auth/react";
import Navbar from "~/components/navbar";
import Link from "next/link";

export default function Hero() {
  return (
    <SessionProvider>
      <Navbar />
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="md:text-10xl mb-4 text-8xl font-bold leading-none">
          Xeno CRM.
        </h1>
        <p className="mb-8 text-3xl md:text-5xl">
          Discover the perfect campaign.
        </p>
        <Link
          href="/audience"
          className="bg-white px-10 py-4 text-lg text-black hover:bg-gray-200 rounded"
        >
          Explore Audience
        </Link>
      </section>
    </SessionProvider>
  );
}
