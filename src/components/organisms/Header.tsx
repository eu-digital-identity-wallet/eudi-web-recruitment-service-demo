import { AppBar, Toolbar, Box, Container, Typography } from '@mui/material';
import Link from 'next/link';
import React from 'react';

const Header: React.FC = () => {
	return (
		<AppBar
			position="static"
			color="primary"
			elevation={0}
			sx={{ borderBottom: 1, borderColor: 'divider' }}
		>
			<Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
				<Toolbar
					disableGutters
					sx={{
						width: '100%',
						py: 2,
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						gap: 2,
						flexWrap: { xs: 'wrap', md: 'nowrap' },
					}}
				>
					{/* Logo */}
					<Link href="/" aria-label="Recruitment Service home" style={{ textDecoration: 'none' }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
							{/* Monogram badge */}
							<Box
								aria-hidden
								sx={{
									display: 'inline-flex',
									alignItems: 'center',
									justifyContent: 'center',
									fontWeight: 800,
									fontSize: { xs: 12, sm: 13 },
									letterSpacing: 0.6,
									bgcolor: 'secondary.main',
									color: 'primary.main',
									borderRadius: 1.5,
									px: 1,
									py: 0.5,
									minWidth: 36,
									height: 28,
									lineHeight: 1,
								}}
							>
								RSD
							</Box>

							{/* Wordmark */}
							<Typography
								variant="h5"
								component="div"
								sx={{
									fontWeight: 700,
									letterSpacing: 0.3,
									color: 'common.white',
									display: 'inline-flex',
									alignItems: 'baseline',
									gap: 0.5,
								}}
							>
								Recruitment{' '}
								<Box component="span" sx={{ color: 'secondary.main' }}>
									Service
								</Box>
								Demo
							</Typography>
						</Box>
					</Link>

					{/* Right side placeholder (add nav/actions here as needed) */}
					<Box sx={{ minWidth: 0 }} />
				</Toolbar>
			</Container>
		</AppBar>
	);
};

export default Header;
