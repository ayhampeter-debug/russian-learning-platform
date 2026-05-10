"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export function UserSync() {
  const { isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      return;
    }

    const controller = new AbortController();

    fetch("/api/user-sync", {
      method: "POST",
      signal: controller.signal,
    }).catch(() => {
      // Server logs the sync failure without exposing details to the client.
    });

    return () => {
      controller.abort();
    };
  }, [isLoaded, isSignedIn]);

  return null;
}
