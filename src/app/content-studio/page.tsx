import type { Metadata } from "next";
import ContentStudioApp from "@/components/content-studio/ContentStudioApp";

export const metadata: Metadata = {
  title: "Content Studio | Rook System",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ContentStudioPage() {
  return <ContentStudioApp />;
}
