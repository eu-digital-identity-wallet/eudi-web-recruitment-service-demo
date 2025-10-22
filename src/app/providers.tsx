'use client';

import { ThemeProvider, CssBaseline } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import { theme } from '@/theme';

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<AppRouterCacheProvider>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				{children}
				<ToastContainer position="bottom-center" autoClose={3000} />
			</ThemeProvider>
		</AppRouterCacheProvider>
	);
}
