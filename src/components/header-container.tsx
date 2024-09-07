'use client';

export default function HeaderContainer({ children }: { children: React.ReactNode }) {
  return (
    <header className="fixed top-0 px-2 w-full h-14 border-b flex items-center bg-background z-40">{children}</header>
  );
}
