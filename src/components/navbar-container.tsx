'use client';
import clsx from 'clsx';

import { useNavbar } from '@/providers/navbar';

export default function NavbarContainer({ children }: { children: React.ReactNode }) {
  const { isOpen } = useNavbar();

  return (
    <nav
      className={clsx(
        'fixed top-0 h-dvh w-64 p-2 border-r bg-background z-50 transition-transform',
        !isOpen && 'max-lg:-translate-x-full'
      )}
    >
      {children}
    </nav>
  );
}
