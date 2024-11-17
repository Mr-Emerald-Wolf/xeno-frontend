import { type DefaultSession, type NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import axios, { type AxiosResponse } from "axios";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
    } & DefaultSession["user"];
  }
}

// Define the expected response type from your backend
interface BackendResponse {
  success: boolean;
  message?: string;
  data?: {
    id: number; // Assuming the customer ID is a number
    name: string;
    email: string;
    totalSpending: string;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig: NextAuthConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) {
        console.error("User email is required but missing.");
        return false;
      }

      try {
        const response: AxiosResponse<BackendResponse> = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/customers`,
          { email: user.email },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        // Type-safe response handling
        if (response.data.success && response.data.data) {
          // Attach customer ID to the user session
          user.id = response.data.data.id.toString(); 
          return true;
        }

        console.error("Backend rejected sign-in:", response.data.message);
        return false;
      } catch (error) {
        // Type-guard for AxiosError
        if (axios.isAxiosError(error)) {
          console.error(
            "Axios error during backend callback:",
            error.response?.data || error.message
          );
        } else if (error instanceof Error) {
          console.error("General error during backend callback:", error.message);
        } else {
          console.error("Unknown error during backend callback:", String(error));
        }
        return false; // Reject sign-in on failure
      }
    },
    async session({ session, token }) {
      // Enrich the session with the user's ID from token and customer data
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub ?? "",
          customerId: session.user.id, // Store customer ID in the session
          email: session.user?.email ?? "",
        },
      };
    },
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
