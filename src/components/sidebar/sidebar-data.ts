import { ClipboardList, Package, SquarePen, type LucideIcon } from "lucide-react";

export type SidebarRoute = {
  name: string;
  href: string;
  icon: LucideIcon;
};

export const SIDEBAR_ROUTES: SidebarRoute[] = [
  { name: "New Order", href: "/orders/new", icon: SquarePen },
  { name: "Orders", href: "/orders", icon: ClipboardList },
  { name: "Catalogue", href: "/products", icon: Package },
];

export const SIDEBAR_CTA = {
  label: "New order",
  href: "/orders/new",
};

export function isRouteActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/orders/new") return pathname === href || pathname === "/";
  if (href === "/orders") {
    if (pathname === "/orders") return true;
    return pathname.startsWith("/orders/") && !pathname.startsWith("/orders/new");
  }
  return pathname === href || pathname.startsWith(href + "/");
}
