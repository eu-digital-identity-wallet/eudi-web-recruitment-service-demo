import type { ReactNode } from 'react';
import Providers from './providers';

import AppLayout from '@/components/organisms/AppLayout'; // optional
import { Metadata } from 'next/types';

export const metadata: Metadata = { title: 'Employer Service' };


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {typeof AppLayout === 'function' ? <AppLayout>{children}</AppLayout> : children}
        </Providers>
      </body>
    </html>
  );
}
