import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/AdminLayout";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — AquaMar" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});