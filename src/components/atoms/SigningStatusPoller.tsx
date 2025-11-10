'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';

import { createLogger } from '@/core/infrastructure/logging/Logger';

const logger = createLogger('SigningStatusPoller');

const fetcher = async (url: string) => {
	const res = await fetch(url, { cache: 'no-store' });
	if (!res.ok) throw new Error('poll failed');
	return (await res.json()) as {
		status: string;
		signedAt?: string;
		errorCode?: string;
	};
};

export default function SigningStatusPoller({ applicationId }: { applicationId: string }) {
	const router = useRouter();
	const { data } = useSWR(`/api/applications/${applicationId}/sign-contract-status`, fetcher, {
		refreshInterval: 1500,
		revalidateOnFocus: false,
		dedupingInterval: 500,
	});

	useEffect(() => {
		if (data?.status === 'SIGNED') {
			logger.info('Document signed successfully');
			toast.success('Contract signed successfully!');
			// Navigate to employee page where user can optionally share tax residency and issue Employee ID
			router.push(`/applications/${applicationId}/employee`);
		} else if (data?.status === 'FAILED') {
			logger.error('Document signing failed', new Error(data.errorCode || 'Unknown error'));
			toast.error(`Signing failed: ${data.errorCode || 'Unknown error'}. Please try again.`);
			// Stay on signing page so user can retry by scanning the QR code again
		}
	}, [data?.status, data?.errorCode, applicationId, router]);

	return null;
}
