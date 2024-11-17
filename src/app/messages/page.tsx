"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Skeleton } from "~/components/ui/skeleton";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

type Message = {
  id: number;
  customerId: number;
  message: string;
  sentAt: string;
  status: "COMPLETED" | "FAILED";
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse = {
  data: Message[] | null;
  error?: boolean;
  message?: string;
};

export default function CustomerMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchMessages = async () => {
      if (!session?.user?.id) {
        setError("User not authenticated or customer ID not found.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await axios.get<ApiResponse>(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/customers/messages/${session.user.id}`,
        );

        if (response.data.error || !response.data.data) {
          setError(
            response.data.message ?? "No messages found for this customer.",
          );
          setMessages([]);
        } else {
          setMessages(response.data.data);
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Failed to fetch messages. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchMessages();
  }, [session]);

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-4 p-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Your Messages</h1>
      {messages.length === 0 ? (
        <p className="text-muted-foreground">You have no messages yet.</p>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <Card key={message.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Message #{message.id}</span>
                  {message.status === "COMPLETED" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2">{message.message}</p>
                <div className="text-muted-foreground text-sm">
                  <p>Sent at: {message.sentAt}</p>
                  <p>Status: {message.status}</p>
                  {message.errorMessage && (
                    <p className="text-red-500">
                      Error: {message.errorMessage}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
