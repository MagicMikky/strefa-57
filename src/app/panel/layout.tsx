import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Panel pracownika",
  robots: { index: false, follow: false, nocache: true },
};

export default function PanelLayout({ children }: { children: ReactNode }) {
  return children;
}
