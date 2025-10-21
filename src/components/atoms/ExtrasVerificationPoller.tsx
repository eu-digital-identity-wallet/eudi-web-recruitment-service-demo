'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';

const fetcher = async (url: string) => {
	const res = await fetch(url, { cache: 'no-store' });
	if (!res.ok) throw new Error('poll failed');
	return (await res.json()) as { status: boolean };
};

export default function ExtrasVerificationPoller({ applicationId }: { applicationId: string }) {
	const router = useRouter();
	const { data } = useSWR(`/api/applications/verification-extras/${applicationId}`, fetcher, {
		refreshInterval: 1500,
		revalidateOnFocus: false,
		dedupingInterval: 500,
	});

	useEffect(() => {
		if (data?.status === true) {
			console.log('Extras verification complete, navigating to confirmation');
			toast.success('Additional credentials verified');
			router.push(`/applications/${applicationId}/confirmation`);
		}
	}, [data?.status, applicationId, router]);

	return null;
}
