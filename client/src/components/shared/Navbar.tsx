import React from 'react';
import { LuBell, LuUser, LuLogOut } from 'react-icons/lu';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ROUTES } from '../../lib/constants';

export const Navbar: React.FC = () => {
  const { user, role, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    if (role === 'patient') navigate(ROUTES.PATIENT.AUTH);
    else if (role === 'doctor') navigate(ROUTES.DOCTOR.AUTH);
    else if (role === 'hospital') navigate(ROUTES.HOSPITAL.AUTH);
    else navigate(ROUTES.LANDING);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold text-primary hidden md:block">MediNexus</h2>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <LuBell size={20} />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src="" alt={user?.name || 'User'} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user?.name?.charAt(0) || <LuUser size={18} />}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || 'Guest'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || 'Not logged in'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={handleLogout}>
              <LuLogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
