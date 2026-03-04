'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home,
  FileText,
  Settings,
  Menu,
  X,
  User,
  LogOut,
  ChevronRight,
  Image,
  Calendar,
  FolderOpen,
  Award,
  Mail,
  Users,
  Navigation,
  Sparkles,
  Layers,
} from 'lucide-react';

const sidebarNavigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: Home,
  },
  {
    group: 'Content',
    items: [
      {
        name: 'Pages',
        href: '/admin/pages',
        icon: Layers,
        subItems: [
          { name: 'All Pages', href: '/admin/pages' },
          { name: 'Create Page', href: '/admin/pages/new' },
        ],
      },
      {
        name: 'Blog',
        href: '/admin/blog',
        icon: FileText,
        subItems: [
          { name: 'All Posts', href: '/admin/blog' },
          { name: 'Generate with AI', href: '/admin/blog/generate' },
        ],
      },
      {
        name: 'Media',
        href: '/admin/media',
        icon: Image,
      },
    ],
  },
  {
    group: 'Programs',
    items: [
      {
        name: 'Events',
        href: '/admin/events',
        icon: Calendar,
      },
      {
        name: 'Awards',
        href: '/admin/awards',
        icon: Award,
      },
      {
        name: 'Resources',
        href: '/admin/resources',
        icon: FolderOpen,
      },
    ],
  },
  {
    group: 'People',
    items: [
      {
        name: 'Members',
        href: '/admin/members',
        icon: Users,
      },
      {
        name: 'Contacts',
        href: '/admin/contacts',
        icon: Mail,
      },
    ],
  },
  {
    group: 'Settings',
    items: [
      {
        name: 'Navigation',
        href: '/admin/navigation',
        icon: Navigation,
      },
      {
        name: 'AI Templates',
        href: '/admin/templates',
        icon: Sparkles,
      },
      {
        name: 'Site Settings',
        href: '/admin/settings',
        icon: Settings,
      },
    ],
  },
];

type NavItem = {
  name: string;
  href: string;
  icon: any;
  subItems?: { name: string; href: string }[];
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Don't wrap login page with admin shell
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isItemActive = (item: NavItem) => {
    if (pathname === item.href) return true;
    if (item.subItems) {
      return item.subItems.some((sub) => pathname.startsWith(sub.href));
    }
    return item.href !== '/admin' && pathname.startsWith(item.href);
  };

  const renderNavItem = (item: NavItem) => {
    const isActive = isItemActive(item);
    const isExpanded = expandedItems.includes(item.name);

    return (
      <div key={item.name}>
        <button
          onClick={() => {
            if (item.subItems) {
              toggleExpanded(item.name);
            } else {
              router.push(item.href);
              setSidebarOpen(false);
            }
          }}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
            isActive
              ? 'bg-nafsma-blue text-white'
              : 'text-gray-700 hover:bg-nafsma-light-blue hover:text-nafsma-blue'
          )}
        >
          <item.icon
            className={cn('h-4 w-4 flex-shrink-0', isActive ? 'text-white' : 'text-gray-500')}
          />
          <span className="flex-1 text-left">{item.name}</span>
          {item.subItems && (
            <ChevronRight
              className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-90')}
            />
          )}
        </button>

        {item.subItems && isExpanded && (
          <div className="mt-1 ml-7 space-y-1">
            {item.subItems.map((subItem) => (
              <Link
                key={subItem.href}
                href={subItem.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'block px-3 py-1.5 rounded-md text-sm transition-colors',
                  pathname === subItem.href
                    ? 'bg-nafsma-light-blue text-nafsma-blue font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-nafsma-blue'
                )}
              >
                {subItem.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
        <div className="flex h-14 items-center px-4">
          <button
            className="lg:hidden mr-4 p-2 hover:bg-gray-100 rounded-md"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link href="/admin" className="flex items-center gap-2">
            <div className="bg-nafsma-blue text-white px-2 py-1 rounded text-xs font-bold">
              NAFSMA
            </div>
            <span className="text-sm text-gray-500 hidden sm:inline">Admin</span>
          </Link>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="text-xs text-gray-500 hover:text-nafsma-blue"
            >
              View Site
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <div className="h-7 w-7 rounded-full bg-nafsma-blue text-white flex items-center justify-center">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <span className="hidden md:inline text-sm font-medium">
                    {session?.user?.name || 'Admin'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>
                  <p className="text-sm font-medium">{session?.user?.name}</p>
                  <p className="text-xs text-gray-500">{session?.user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 cursor-pointer"
                  onClick={() => signOut({ callbackUrl: '/admin/login' })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-14 left-0 z-40 w-60 transform bg-white border-r transition-transform lg:relative lg:inset-y-0 lg:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <nav className="h-full overflow-y-auto p-3">
            <div className="space-y-1">
              {/* Dashboard (top-level) */}
              {renderNavItem(sidebarNavigation[0] as NavItem)}
            </div>

            {/* Grouped sections */}
            {sidebarNavigation.slice(1).map((section: any) => (
              <div key={section.group} className="mt-6">
                <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {section.group}
                </p>
                <div className="space-y-1">
                  {section.items.map((item: NavItem) => renderNavItem(item))}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8">{children}</div>
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
