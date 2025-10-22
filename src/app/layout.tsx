import AppLayout from '@/components/organisms/AppLayout'; // optional

import Providers from './providers';

import type { Metadata } from 'next/types';
import type { ReactNode } from 'react';

export const metadata: Metadata = { title: 'Recruitment Service Demo' };

export const dynamic = 'force-dynamic';

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
