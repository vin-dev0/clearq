"use client";

import * as React from "react";
import { ToastContainer } from "../ui/ToastContainer";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
}
