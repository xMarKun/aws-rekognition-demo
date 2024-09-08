import Link from 'next/link';

import { Button } from '@/components/ui/button';
import NavbarContainer from '@/components/navbar-container';
import ToggleNavbar from '@/components/toggle-navbar';

const pages = [
  {
    path: '/image-face-detection',
    title: 'イメージ内の顔を検知',
  },
  {
    path: '/image-compare-faces',
    title: 'イメージ間の顔の比較',
  },
];

export default function Navbar() {
  return (
    <NavbarContainer>
      <div className="h-12 flex items-center lg:justify-center">
        <ToggleNavbar />
        <p className="font-mono font-bold text-sm max-lg:ml-4">AWS Rekognition Demo</p>
      </div>
      <ul className="pt-2">
        {pages.map(({ path, title }) => (
          <li key={path}>
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link href={path}>{title}</Link>
            </Button>
          </li>
        ))}
      </ul>
    </NavbarContainer>
  );
}
