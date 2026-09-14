import { Bell } from 'lucide-react';
import { Button } from '../ui/button';

export function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-medium">Dashboard</h2>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="h-8 w-8 px-0 rounded-full" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
