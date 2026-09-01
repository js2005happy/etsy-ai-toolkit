import type { Metadata } from "next";
import AurevonLanding from "@/components/aurevon/aurevon-landing";

export const metadata: Metadata = {
  title: "Craftly — AI tools for e-commerce sellers",
};

export default function Home() {
  return <AurevonLanding />;
}
