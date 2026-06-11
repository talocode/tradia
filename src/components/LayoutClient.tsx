// components/LayoutClient.tsx

"use client";

import { ReactNode } from "react";
import UpgradeModal from "@/components/modals/UpgradeModal";

interface LayoutClientProps {
  children: ReactNode;
}

const LayoutClient = ({ children }: LayoutClientProps) => {
  return (
    <>
      {children}
      <UpgradeModal />
    </>
  );
};

export default LayoutClient;
