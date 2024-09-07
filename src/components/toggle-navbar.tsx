'use client';
import { HamburgerMenuIcon } from '@radix-ui/react-icons';

import { Button } from '@/components/ui/button';
import { useNavbar } from '@/providers/navbar';

export default function ToggleNavbar() {
  const { setOpen } = useNavbar();

  const handleToggle = () => setOpen((prev) => !prev);

  return (
    <Button variant="outline" size="icon" onClick={handleToggle} className="lg:hidden">
      <HamburgerMenuIcon />
    </Button>
  );
}
