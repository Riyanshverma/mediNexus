import React from 'react';
import { NavLink } from 'react-router-dom';
import { LuSettings } from 'react-icons/lu';
import { ScrollArea } from '../ui/scroll-area';

interface SidebarLink {
  icon: React.ReactNode;
  label: string;
  path: string;
}

interface SidebarProps {
  links: SidebarLink[];
}

export const Sidebar: React.FC<SidebarProps> = ({ links }) => {
  return (
    <aside className="hidden md:flex w-56 flex-col border-r bg-background">
      <div className="flex h-16 items-center px-6 border-b">
        <h1 className="text-xl font-bold text-primary">MediNexus</h1>
      </div>
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 pl-4 pr-3">
          {links.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
      </ScrollArea>
      <div className="p-4 border-t">
        <button className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm w-full text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all">
          <LuSettings size={20} className="shrink-0" />
          Settings
        </button>
      </div>
    </aside>
  );
};
