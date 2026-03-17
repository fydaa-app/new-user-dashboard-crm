"use client";

interface GoalCategory {
  categoryName: string;
  goals: {
    goalId: number;
    goalName: string;
    totalGoalAmount: number;
    totalInvestedAmount: number;
    goalPercentage: number;
    investedPercentage: number;
  }[];
  totalGoalAmount: number;
  totalInvestedAmount: number;
  goalCount: number;
}

interface GoalsByCategoryData {
  categories: GoalCategory[];
  summary: {
    totalGoals: number;
    totalGoalAmount: number;
    totalInvestedAmount: number;
  };
}

interface GoalsByCategoryCardProps {
  data: GoalsByCategoryData | null;
  loading: boolean;
}

const categoryColors: Record<string, string> = {
  "Emergency Fund": "bg-blue-500",
  "Retirement Plan": "bg-green-500",
  "Child Education": "bg-purple-500",
  "Child Marriage": "bg-pink-500",
  "House Purchase": "bg-yellow-500",
  "Vacation": "bg-orange-500",
  "Vehicle": "bg-cyan-500",
  "Debt Repayment": "bg-red-500",
  "Medical Emergency": "bg-teal-500",
  "Wealth Creation": "bg-indigo-500",
};

function getCategoryColor(categoryName: string): string {
  const keys = Object.keys(categoryColors);
  const index = keys.findIndex(k => categoryName.toLowerCase().includes(k.toLowerCase()));
  if (index >= 0) return categoryColors[keys[index]];
  
  const colorClasses = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-yellow-500",
    "bg-orange-500",
    "bg-cyan-500",
    "bg-red-500",
    "bg-teal-500",
    "bg-indigo-500",
  ];
  return colorClasses[Math.abs(categoryName.charCodeAt(0)) % colorClasses.length];
}

export default function GoalsByCategoryCard({
  data,
  loading,
}: GoalsByCategoryCardProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!data || !data.categories || data.categories.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          No goals data available
        </p>
      </div>
    );
  }

  const totalInvested = data.summary.totalInvestedAmount;

  const sortedCategories = [...data.categories].sort((a, b) => {
    const percentA = a.totalInvestedAmount > 0 ? (a.totalInvestedAmount / totalInvested) * 100 : 0;
    const percentB = b.totalInvestedAmount > 0 ? (b.totalInvestedAmount / totalInvested) * 100 : 0;
    return percentB - percentA;
  });

  return (
    <div className="space-y-6">
      {sortedCategories.map((category) => {
        const colorClass = getCategoryColor(category.categoryName);
        
        return (
          <div key={category.categoryName} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${colorClass}`}></div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {category.categoryName}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {category.totalInvestedAmount > 0
                    ? ((category.totalInvestedAmount / totalInvested) * 100).toFixed(2)
                    : 0}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>
                ₹{category.totalInvestedAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
              <span>{category.goalCount} goal{category.goalCount !== 1 ? 's' : ''}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className={`h-full ${colorClass} transition-all duration-300`}
                style={{
                  width: `${category.totalInvestedAmount > 0 && totalInvested > 0
                    ? (category.totalInvestedAmount / totalInvested) * 100
                    : 0}%`
                }}
              ></div>
            </div>
          </div>
        );
      })}
      
      {data.summary && (
        <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-900 dark:text-white">Total Invested</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              ₹{data.summary.totalInvestedAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
