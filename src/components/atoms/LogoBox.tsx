import { Box } from '@mui/material';
import Image from 'next/image';

export default function LogoBox() {
	return (
		<Box
			sx={{
				mb: 2,
				bgcolor: 'white',
				p: 2,
				border: 1,
				borderColor: 'divider',
				display: 'flex',
				flexDirection: 'row',
				gap: 2,
				alignItems: 'center',
				justifyContent: 'center',
				overflow: 'hidden',
			}}
		>
			<Image
				src="/logo-european-commission.svg"
				alt="European Commission"
				width={160}
				height={70}
				priority
				style={{ objectFit: 'contain' }}
			/>
			<Box sx={{ width: '2px', height: '40px', bgcolor: 'primary.main' }} />
			<Image
				src="/eudi-wallet-official.svg"
				alt="EU Digital Identity Wallet"
				width={130}
				height={45}
				priority
				style={{ objectFit: 'contain' }}
			/>
		</Box>
	);
}
