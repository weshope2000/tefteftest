import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const adminNav = [
  { label: "Overview", href: "/dashboard/admin" },
  { label: "Users & Verification", href: "/dashboard/admin/users" },
  { label: "Jobs & Categories", href: "/dashboard/admin/jobs" },
  { label: "Bids & Contracts", href: "/dashboard/admin/bids" },
  { label: "Payments & Subscriptions", href: "/dashboard/admin/payments" },
  { label: "Disputes & Reports", href: "/dashboard/admin/disputes" },
  { label: "Reviews & Moderation", href: "/dashboard/admin/reviews" },
  { label: "Messages & Support", href: "/dashboard/admin/messages" },
  { label: "Analytics & Reports", href: "/dashboard/admin/analytics" },
  { label: "Notifications", href: "/dashboard/admin/notifications" },
  { label: "Admin Roles & Permissions", href: "/dashboard/admin/roles" },
  { label: "Audit Logs", href: "/dashboard/admin/audit" },
  { label: "Platform Settings", href: "/dashboard/admin/settings" },
  { label: "System Health", href: "/dashboard/admin/health" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-bold">WORKSPACE</h2>
        <p className="text-xs text-gray-400 mt-1">Admin Workspace</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          <li>
            <Link
              href="/"
              className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800"
            >
              ? Back to site
            </Link>
          </li>
          {adminNav.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard/admin" &&
                pathname?.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive ? "bg-[#26734D] text-white" : "text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition text-left"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
