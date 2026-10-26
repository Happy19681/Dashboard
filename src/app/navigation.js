import {
  Banknote,
  Cable,
  CircleHelp,
  ClipboardList,
  FileText,
  Headset,
  House,
  Megaphone,
  MessageCircle,
  MessagesSquare,
  ReceiptText,
  Settings,
  Store,
  UserCog,
  Users,
  UsersRound,
} from "lucide-react";

export const navigationGroups = [
  {
    label: "Main Menu",
    items: [
      { label: "Dashboard", path: "/", title: "Dashboard", kind: "dashboard", icon: House },
      { label: "Products", path: "/products", title: "Products", icon: Store },
      { label: "Transactions", path: "/transactions", title: "Transactions", icon: Banknote },
      { label: "Reports & Analytics", path: "/reports", title: "Reports & Analytics", icon: FileText },
      { label: "Messages", path: "/messages", title: "Messages", icon: MessageCircle },
      { label: "Team Performance", path: "/team-performance", title: "Team Performance", icon: UsersRound },
      { label: "Campaigns", path: "/campaigns", title: "Campaigns", icon: Megaphone },
    ],
  },
  {
    label: "Customers",
    items: [
      { label: "Customer List", path: "/customers", title: "Customer List", icon: Users },
      { label: "Channels", path: "/channels", title: "Channels", icon: MessagesSquare },
      { label: "Order Management", path: "/orders", title: "Order Management", icon: ClipboardList },
    ],
  },
  {
    label: "Management",
    items: [
      { label: "Roles & Permissions", path: "/roles", title: "Roles & Permissions", icon: UserCog },
      { label: "Billing & Subscription", path: "/billing", title: "Billing & Subscription", icon: ReceiptText },
      { label: "Integrations", path: "/integrations", title: "Integrations", icon: Cable },
    ],
  },
  {
    label: "Settings",
    items: [
      { label: "Customer Support", path: "/support", title: "Customer Support", icon: Headset },
      { label: "Help Center", path: "/help-center", title: "Help Center", icon: CircleHelp },
      { label: "System Settings", path: "/settings", title: "System Settings", icon: Settings },
    ],
  },
];

export const dashboardPages = navigationGroups
  .flatMap((group) => group.items)
  .filter((page) => page.kind !== "dashboard");
