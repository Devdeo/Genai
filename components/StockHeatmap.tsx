
"use client";
import { useEffect, useState } from "react";

interface StockData {
  symbol: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
}

export default function StockHeatmap() {
  const [heatmapData, setHeatmapData] = useState<StockData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSector, setSelectedSector] = useState<string>("All");

  const getHeatmapData = async () => {
    const token = localStorage.getItem("upstox_token");
    if (!token) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/market-heatmap", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.status === "success") {
        setHeatmapData(json.data);
      }
    } catch (error) {
      console.error("Error fetching heatmap data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getHeatmapData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(getHeatmapData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getColorForChange = (changePercent: number): string => {
    if (changePercent > 5) return "bg-green-600";
    if (changePercent > 2) return "bg-green-500";
    if (changePercent > 0) return "bg-green-400";
    if (changePercent === 0) return "bg-gray-400";
    if (changePercent > -2) return "bg-red-400";
    if (changePercent > -5) return "bg-red-500";
    return "bg-red-600";
  };

  const getTextColor = (changePercent: number): string => {
    return Math.abs(changePercent) > 1 ? "text-white" : "text-gray-800";
  };

  const sectors = ["All", ...new Set(heatmapData.map(stock => stock.sector))];
  
  const filteredData = selectedSector === "All" 
    ? heatmapData 
    : heatmapData.filter(stock => stock.sector === selectedSector);

  const sortedData = [...filteredData].sort((a, b) => b.changePercent - a.changePercent);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Stock Market Heatmap</h2>
          <p className="text-gray-600">Color-coded by percentage change</p>
        </div>
        <div className="flex gap-4 items-center">
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sectors.map(sector => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>
          <button
            onClick={getHeatmapData}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-4 flex items-center gap-4 text-sm">
        <span className="font-medium">Legend:</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-600"></div>
          <span>&gt;5%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-500"></div>
          <span>2-5%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-400"></div>
          <span>0-2%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-400"></div>
          <span>0%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-red-400"></div>
          <span>0 to -2%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-red-500"></div>
          <span>-2 to -5%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-red-600"></div>
          <span>&lt;-5%</span>
        </div>
      </div>

      {isLoading && heatmapData.length === 0 ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading heatmap data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
          {sortedData.map((stock) => (
            <div
              key={stock.symbol}
              className={`p-3 rounded-lg transition-all duration-200 hover:scale-105 cursor-pointer ${getColorForChange(stock.changePercent)} ${getTextColor(stock.changePercent)}`}
              title={`${stock.symbol} (${stock.sector})\nPrice: ₹${stock.price.toFixed(2)}\nChange: ${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)} (${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%)\nVolume: ${stock.volume.toLocaleString()}`}
            >
              <div className="text-center">
                <div className="font-bold text-sm mb-1">{stock.symbol}</div>
                <div className="text-xs opacity-90">{stock.sector}</div>
                <div className="text-sm font-semibold mt-1">₹{stock.price.toFixed(2)}</div>
                <div className="text-xs">
                  {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Statistics */}
      {heatmapData.length > 0 && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-green-100 p-3 rounded-lg">
            <div className="text-lg font-bold text-green-700">
              {filteredData.filter(s => s.changePercent > 0).length}
            </div>
            <div className="text-sm text-green-600">Gainers</div>
          </div>
          <div className="bg-red-100 p-3 rounded-lg">
            <div className="text-lg font-bold text-red-700">
              {filteredData.filter(s => s.changePercent < 0).length}
            </div>
            <div className="text-sm text-red-600">Losers</div>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg">
            <div className="text-lg font-bold text-blue-700">
              {filteredData.length > 0 ? (filteredData.reduce((sum, s) => sum + s.changePercent, 0) / filteredData.length).toFixed(2) : '0.00'}%
            </div>
            <div className="text-sm text-blue-600">Avg Change</div>
          </div>
          <div className="bg-gray-100 p-3 rounded-lg">
            <div className="text-lg font-bold text-gray-700">
              {filteredData.length}
            </div>
            <div className="text-sm text-gray-600">Total Stocks</div>
          </div>
        </div>
      )}
    </div>
  );
}
