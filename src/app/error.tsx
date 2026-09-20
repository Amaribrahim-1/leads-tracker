"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <div
      className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8"
      role="alert"
    >
      <header className="flex flex-col gap-2">
        <p className="text-sage text-base font-medium tracking-wide uppercase">
          Pipeline
        </p>
        <h1 className="font-heading text-4xl font-medium tracking-tight sm:text-5xl">
          Couldn&apos;t load leads
        </h1>
        <p className="text-muted-foreground max-w-xl text-base sm:text-lg">
          Check your connection, then try again.
        </p>
      </header>

      <Button
        type="button"
        size="lg"
        className="h-11 w-fit text-base"
        onClick={() => retry()}
      >
        Try again
      </Button>
    </div>
  );
}
