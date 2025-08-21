"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function MarketData() {
  const [data, setData] = useState<any>(null);
  const [greeksData, setGreeksData] = useState<any>(null);
  const [ohlcData, setOhlcData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Step 1: check token in URL (after callback)
    const { access_token } = router.query;
    if (access_token && typeof access_token === "string") {
      localStorage.setItem("upstox_token", access_token);
      // remove token from URL after saving
      router.replace("/market", undefined, { shallow: true });
      setIsLoading(false);
      return;
    }

    // Step 2: if no token in localStorage, redirect to login
    const stored = localStorage.getItem("upstox_token");
    if (!stored) {
      window.location.href = "/api/auth";
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const getData = async () => {
    const token = localStorage.getItem("upstox_token");
    if (!token) return;

    const res = await fetch("/api/market-quote", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    setData(json);
  };

  const getNiftyGreeks = async () => {
    const token = localStorage.getItem("upstox_token");
    if (!token) return;

    const res = await fetch("/api/nifty-greeks", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    setGreeksData(json);
  };

  const getNiftyOHLC = async () => {
    const token = localStorage.getItem("upstox_token");
    if (!token) return;

    const res = await fetch("/api/nifty-ohlc", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    setOhlcData(json);
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex gap-4 mb-4">
        <button
          onClick={getData}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Get Reliance Quote
        </button>
        <button
          onClick={getNiftyGreeks}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Get Nifty Option Greeks
        </button>
        <button
          onClick={getNiftyOHLC}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Get Nifty OHLC
        </button>
      </div>

      {data && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Reliance Market Data:</h3>
          <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}

      {greeksData && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Nifty Option Greeks:</h3>
          <pre className="bg-gray-900 text-yellow-400 p-4 rounded overflow-auto">
            {JSON.stringify(greeksData, null, 2)}
          </pre>
        </div>
      )}

      {ohlcData && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Nifty OHLC Data:</h3>
          <pre className="bg-gray-900 text-blue-400 p-4 rounded overflow-auto">
            {JSON.stringify(ohlcData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
