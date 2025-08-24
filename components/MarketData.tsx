"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function MarketData() {
  const [data, setData] = useState<any>(null);
  const [greeksData, setGreeksData] = useState<any>(null);
  const [ohlcData, setOhlcData] = useState<any>(null);
  const [openInterestData, setOpenInterestData] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [stockSymbol, setStockSymbol] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
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

  const getNiftyOpenInterest = async () => {
    const token = localStorage.getItem("upstox_token");
    if (!token) return;

    const res = await fetch("/api/nifty-open-interest", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    setOpenInterestData(json);
  };

  const searchStocks = async () => {
    if (!searchQuery.trim()) return;
    
    const token = localStorage.getItem("upstox_token");
    if (!token) return;

    const res = await fetch(`/api/search-stocks?query=${encodeURIComponent(searchQuery)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    setSearchResults(json);
  };

  const getStockQuote = async () => {
    if (!stockSymbol.trim()) return;
    
    const token = localStorage.getItem("upstox_token");
    if (!token) return;

    const res = await fetch(`/api/stock-quote?symbol=${encodeURIComponent(stockSymbol)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    setData(json);
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
      {/* Stock Search Section */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Stock Search</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stocks (e.g., Reliance, TCS, HDFC)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && searchStocks()}
          />
          <button
            onClick={searchStocks}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Search
          </button>
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={stockSymbol}
            onChange={(e) => setStockSymbol(e.target.value)}
            placeholder="Enter stock symbol (e.g., NSE_EQ|INE002A01018)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            onKeyPress={(e) => e.key === 'Enter' && getStockQuote()}
          />
          <button
            onClick={getStockQuote}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Get Quote
          </button>
        </div>
      </div>

      {/* Quick Access Buttons */}
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
        <button
          onClick={getNiftyOpenInterest}
          className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
        >
          Get Nifty Open Interest
        </button>
      </div>

      {searchResults && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Search Results:</h3>
          <pre className="bg-gray-900 text-cyan-400 p-4 rounded overflow-auto">
            {JSON.stringify(searchResults, null, 2)}
          </pre>
        </div>
      )}

      {data && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Stock Market Data:</h3>
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

      {openInterestData && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Nifty Open Interest & Option Chain:</h3>
          {openInterestData.data && openInterestData.data.option_chain ? (
            <div className="space-y-4">
              <div className="bg-gray-100 p-3 rounded">
                <h4 className="font-semibold">Underlying: Nifty 50</h4>
                <p>Price: ₹{openInterestData.data.underlying_price || 'N/A'}</p>
                <p>Available Expiries: {openInterestData.data.expiry_dates?.join(', ') || 'N/A'}</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 border">Strike</th>
                      <th className="px-4 py-2 border">Expiry</th>
                      <th className="px-4 py-2 border text-green-600">CE Price</th>
                      <th className="px-4 py-2 border text-green-600">CE Change</th>
                      <th className="px-4 py-2 border text-green-600">CE OI</th>
                      <th className="px-4 py-2 border text-red-600">PE Price</th>
                      <th className="px-4 py-2 border text-red-600">PE Change</th>
                      <th className="px-4 py-2 border text-red-600">PE OI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {openInterestData.data.option_chain.map((option: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border font-semibold">{option.strike_price}</td>
                        <td className="px-4 py-2 border">{option.expiry}</td>
                        <td className="px-4 py-2 border text-green-600">₹{option.call_options.last_price.toFixed(2)}</td>
                        <td className={`px-4 py-2 border ${option.call_options.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {option.call_options.change >= 0 ? '+' : ''}{option.call_options.change.toFixed(2)} ({option.call_options.change_percent.toFixed(2)}%)
                        </td>
                        <td className="px-4 py-2 border text-green-600">{option.call_options.open_interest.toLocaleString()}</td>
                        <td className="px-4 py-2 border text-red-600">₹{option.put_options.last_price.toFixed(2)}</td>
                        <td className={`px-4 py-2 border ${option.put_options.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {option.put_options.change >= 0 ? '+' : ''}{option.put_options.change.toFixed(2)} ({option.put_options.change_percent.toFixed(2)}%)
                        </td>
                        <td className="px-4 py-2 border text-red-600">{option.put_options.open_interest.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <pre className="bg-gray-900 text-orange-400 p-4 rounded overflow-auto">
              {JSON.stringify(openInterestData, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
