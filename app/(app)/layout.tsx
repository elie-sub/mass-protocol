import { ClientApp } from "@/components/shell/ClientApp";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return <ClientApp>{children}</ClientApp>;
}
