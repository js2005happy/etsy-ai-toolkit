import type { Metadata } from "next";
import AurevonLanding from "@/components/aurevon/aurevon-landing";

export const metadata: Metadata = {
  title: "Etsy AI Toolkit",
};

export default function Home() {
  return <AurevonLanding />;
}
