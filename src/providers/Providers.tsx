"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "./ThemeProvider";
import { useState } from "react";

export const Providers = ({ children }: Readonly<React.PropsWithChildren>) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 10,
          },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system">
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
};