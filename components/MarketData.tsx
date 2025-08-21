"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function MarketData() {
  const [data, setData] = useState<any>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Step 1: check token in URL (after callback)
    const tokenFromUrl = searchParams.get("access_token");
    if (tokenFromUrl) {
      localStorage.setItem("upstox_token", tokenFromUrl);
      // remove token from URL after saving
      router.replace("/market");
      return;
    }

    // Step 2: if no token in localStorage, redirect to login
    const stored = localStorage.getItem("upstox_token");
    if (!stored) {
      window.location.href = "/api/auth";
    }
  }, [searchParams, router]);

  const getData = async () => {
    const token = localStorage.getItem("upstox_token");
    if (!token) return;

    const res = await fetch("/api/market-quote", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    setData(json);
  };

  return (
    <div className="p-4">
      <button
        onClick={getData}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Get Reliance Quote
      </button>

      {data && (
        <pre className="mt-4 bg-gray-900 text-green-400 p-2 rounded">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
