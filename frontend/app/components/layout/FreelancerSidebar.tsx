import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const freelancerNav = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Find Jobs", href: "/dashboard/find-jobs" },
  { label: "My Proposals", href: "/dashboard/proposals" },
  { label: "My Contracts", href: "/dashboard/contracts" },
  { label: "My Projects", href: "/dashboard/projects" },
  { label: "Messages", href: "/dashboard/messages" },
  { label: "Earnings & Payments", href: "/dashboard/payments" },
  { label: "My Profile", href: "/dashboard/profile" },
  { label: "Verification", href: "/dashboard/verification" },
  { label: "Settings", href: "/dashboard/settings" },
  { label: "Help & Support", href: "/dashboard/help" },
];

export function FreelancerSidebar() {
  const pathname = usePathname();
  const { displayName, logout } = useAuth();

  return (
    <aside className="w-[232px] min-h-screen bg-gray-900 text-white flex flex-col" style={{ width: 232 }}>
      <div className="px-4 py-3 border-b border-gray-700" style={{ height: 40 }}>
        <h2 className="text-xl font-bold">WORKSPACE</h2>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-4">
        <ul className="space-y-1">
          {freelancerNav.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                pathname?.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? "bg-green-600 text-white"
                      : "text-gray-300 hover:bg-gray-800"
                  }`}
                  style={{ height: 44 }}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <p className="text-sm text-gray-200 truncate mb-2" title={displayName}>
          {displayName}
        </p>
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
