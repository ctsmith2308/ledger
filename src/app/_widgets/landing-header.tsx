import Link from 'next/link';

import { Button } from '@/app/_components';
import { PublicHeader } from './public-header';

function LandingHeader() {
  return (
    <PublicHeader>
      <Button variant="ghost" size="sm" asChild>
        <Link href="/#architecture">Architecture</Link>
      </Button>

      <Button variant="ghost" size="sm" asChild>
        <Link href="/#case-studies">Case Studies</Link>
      </Button>

      <Button size="sm" asChild>
        <Link href="/demo-login">View demo</Link>
      </Button>
    </PublicHeader>
  );
}

export { LandingHeader };
