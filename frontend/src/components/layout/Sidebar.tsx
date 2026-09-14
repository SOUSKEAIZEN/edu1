import Link from 'next/link';
import { Home, MessageSquare, BookOpen, Calendar, Target, LayoutDashboard, Users, UserCircle } from 'lucide-react';

export function Sidebar({ role = 'STUDENT' }: { role?: 'STUDENT' | 'MENTOR' }) {
  const links = role === 'STUDENT' ? [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'AI Mentor', href: '/mentor', icon: MessageSquare },
    { name: 'Subjects', href: '/subjects', icon: BookOpen },
    { name: 'Tasks & Goals', href: '/tasks', icon: Target },
    { name: 'Schedule', href: '/schedule', icon: Calendar },
  ] : [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Students', href: '/students', icon: Users },
    { name: 'Alerts', href: '/alerts', icon: Target },
  ];

  return (
    <nav className="flex h-full w-64 flex-col border-r bg-surface/50 backdrop-blur-xl transition-colors">
      <div className="flex h-14 items-center border-b px-4">
        <span className="text-sm font-bold tracking-tight">GTU Platform</span>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <ul className="space-y-1 px-2">
          {links.map((link) => (
            <li key={link.name}>
              <Link 
                href={link.href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted hover:bg-muted/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors"
                aria-label={link.name}
              >
                <link.icon className="h-4 w-4" />
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="border-t p-4">
        <Link href="/profile" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted hover:bg-muted/10 hover:text-foreground">
          <UserCircle className="h-4 w-4" />
          Profile
        </Link>
      </div>
    </nav>
  );
}
