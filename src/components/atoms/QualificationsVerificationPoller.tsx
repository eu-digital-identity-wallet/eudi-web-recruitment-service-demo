'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';

import { createLogger } from '@/core/infrastructure/logging/Logger';

const logger = createLogger('QualificationsVerificationPoller');

const fetcher = async (url: string) => {
	const res = await fetch(url, { cache: 'no-store' });
	if (!res.ok) throw new Error('poll failed');
	return (await res.json()) as { status: boolean };
};

export default function QualificationsVerificationPoller({
	applicationId,
}: {
	applicationId: string;
}) {
	const router = useRouter();
	const { data } = useSWR(
		`/api/applications/${applicationId}/verify-qualifications-status`,
		fetcher,
		{
			refreshInterval: 1500,
			revalidateOnFocus: false,
			dedupingInterval: 500,
		},
	);

	useEffect(() => {
		if (data?.status === true) {
			logger.info('Extras verification complete, navigating to confirmation');
			toast.success('Additional credentials verified');
			router.push(`/applications/${applicationId}/finalise`);
		}
	}, [data?.status, applicationId, router]);

	return null;
}
