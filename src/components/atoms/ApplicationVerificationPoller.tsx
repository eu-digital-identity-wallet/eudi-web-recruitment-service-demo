"use client";

import useSWR from "swr";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("poll failed");
  return (await res.json()) as { status: boolean };
};

export default function ApplicationVerificationPoller({
  applicationId,
}: {
  applicationId: string;
}) {
    const router = useRouter();
    const { data } = useSWR(
        `/api/applications/verification/${applicationId}`,
        fetcher,
        { refreshInterval: 1500, revalidateOnFocus: false, dedupingInterval: 500 }
    );
  
    useEffect(() => {
        if (data?.status===true) {
            console.log("Verification complete, navigating to confirmation");
        toast.success("Verification complete");
        // optionally trigger issuance or navigate
        router.push(`/applications/${applicationId}/confirmation`);

        }
    }, [data?.status, applicationId, router]);

    return null;
}
