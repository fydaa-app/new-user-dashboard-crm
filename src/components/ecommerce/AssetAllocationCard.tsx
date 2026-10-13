"use client";

interface AssetData {
  investedValue: number;
  currentValue: number;
  percentage: number;
}

interface AssetAllocationData {
  IndianStock: AssetData;
  GlobalStock: AssetData;
  FixedIncomeBonds: AssetData;
  RealEstate: AssetData;
  Gold: AssetData;
  Unallocated: AssetData;
}

interface AssetAllocationCardProps {
  assetAllocation: AssetAllocationData | null;
  loading: boolean;
}

const assetMapping: Record<string, { name: string; color: string }> = {
  IndianStock: { name: "Equity", color: "bg-blue-500" },
  GlobalStock: { name: "Global Equity", color: "bg-purple-500" },
  FixedIncomeBonds: { name: "Debt", color: "bg-green-500" },
  Gold: { name: "Gold", color: "bg-yellow-500" },
  RealEstate: { name: "Real Estate", color: "bg-orange-500" },
  Unallocated: { name: "Other", color: "bg-gray-500" },
};

export default function AssetAllocationCard({
  assetAllocation,
  loading,
}: AssetAllocationCardProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!assetAllocation) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          No asset allocation data available
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(assetAllocation).map(([key, data]) => {
        const asset = assetMapping[key];
        if (!asset || data.percentage === 0) return null;

        return (
          <div key={key} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${asset.color}`}></div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {asset.name}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {data.percentage.toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>
                ₹{data.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className={`h-full ${asset.color} transition-all duration-300`}
                style={{ width: `${data.percentage}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
