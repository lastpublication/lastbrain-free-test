"use client";

import { Spinner } from "@heroui/react";

export const Loading = () => {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <Spinner className="text-secondary" />
    </div>
  );
};
