"use client";

export interface PackageData {
  packageName: string;
  userCount: number;
  totalAmount: number;
  userPercentage: number;
  amountPercentage: number;
}

const EXPLICIT_PACKAGES = [
  "Comprehensive Financial Plan",
  "Debt Trap Freedom Plan",
  "Wealth Growth Plan",
];

export function transformPackages(rawPackages: PackageData[]): PackageData[] {
  const explicitMap: Record<string, PackageData> = {};

  for (const pkgName of EXPLICIT_PACKAGES) {
    explicitMap[pkgName] = {
      packageName: pkgName,
      userCount: 0,
      totalAmount: 0,
      userPercentage: 0,
      amountPercentage: 0,
    };
  }

  let otherUserCount = 0;
  let otherTotalAmount = 0;

  for (const pkg of rawPackages) {
    if (!pkg.packageName) continue;

    const normalizedName = pkg.packageName.trim();
    const matchedExplicit = EXPLICIT_PACKAGES.find(
      (explicit) => explicit.toLowerCase() === normalizedName.toLowerCase()
    );

    if (matchedExplicit) {
      explicitMap[matchedExplicit].userCount += pkg.userCount || 0;
      explicitMap[matchedExplicit].totalAmount += pkg.totalAmount || 0;
    } else {
      otherUserCount += pkg.userCount || 0;
      otherTotalAmount += pkg.totalAmount || 0;
    }
  }

  const totalUsers = Object.values(explicitMap).reduce(
    (sum, pkg) => sum + pkg.userCount,
    0
  ) + otherUserCount;
  const totalAmount = Object.values(explicitMap).reduce(
    (sum, pkg) => sum + pkg.totalAmount,
    0
  ) + otherTotalAmount;

  const result: PackageData[] = [];

  for (const pkgName of EXPLICIT_PACKAGES) {
    const pkg = explicitMap[pkgName];
    pkg.userPercentage =
      totalUsers > 0 ? parseFloat(((pkg.userCount / totalUsers) * 100).toFixed(2)) : 0;
    pkg.amountPercentage =
      totalAmount > 0 ? parseFloat(((pkg.totalAmount / totalAmount) * 100).toFixed(2)) : 0;
    result.push(pkg);
  }

  result.push({
    packageName: "Other",
    userCount: otherUserCount,
    totalAmount: parseFloat(otherTotalAmount.toFixed(2)),
    userPercentage:
      totalUsers > 0
        ? parseFloat(((otherUserCount / totalUsers) * 100).toFixed(2))
        : 0,
    amountPercentage:
      totalAmount > 0
        ? parseFloat(((otherTotalAmount / totalAmount) * 100).toFixed(2))
        : 0,
  });

  return result;
}
