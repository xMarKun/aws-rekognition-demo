'use client';
import { createContext, useContext, useState } from 'react';

const NavbarContext = createContext<{
  isOpen: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

export function NavbarProvider({ children }: { children: Readonly<React.ReactNode> }) {
  const [isOpen, setOpen] = useState(false);
  return <NavbarContext.Provider value={{ isOpen, setOpen }}>{children}</NavbarContext.Provider>;
}

export function useNavbar() {
  const navbarContext = useContext(NavbarContext);
  if (navbarContext === null) throw new Error('useContext(NavbarContext) must be used within a NavbarContext.Provider');
  return navbarContext;
}
