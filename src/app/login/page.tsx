"use client";
import type { Metadata } from "next";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader className="text-center">
          <div className="mb-4 flex w-full justify-center">
            <Image
              src="/placeholder.svg?height=60&width=60"
              width={60}
              height={60}
              alt="Logo"
              className="rounded-full"
            />
          </div>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full"
            onClick={() => signIn("google", { callbackUrl: "/" })}
          >
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
