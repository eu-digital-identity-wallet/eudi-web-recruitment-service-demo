'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';

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
	const { data } = useSWR(`/api/applications/signing-status/${applicationId}`, fetcher, {
		refreshInterval: 1500,
		revalidateOnFocus: false,
		dedupingInterval: 500,
	});

	useEffect(() => {
		if (data?.status === 'SIGNED') {
			console.log('Document signed successfully');
			toast.success('Contract signed successfully!');
			// Navigate to confirmation page where user can proceed to issue Employee ID
			router.push(`/applications/${applicationId}/confirmation`);
		} else if (data?.status === 'FAILED') {
			console.error('Document signing failed:', data.errorCode);
			toast.error(`Signing failed: ${data.errorCode || 'Unknown error'}. Please try again.`);
			// Stay on signing page so user can retry by scanning the QR code again
		}
	}, [data?.status, data?.errorCode, applicationId, router]);

	return null;
}
