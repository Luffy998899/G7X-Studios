import type { Metadata } from "next";
import CrmClient from "./crm-client";
import "./crm.css";

export const metadata: Metadata = {
  title: "Appointments — G7X Studios",
  robots: { index: false, follow: false },
};

export default function CrmPage() {
  return <CrmClient />;
}
