import React from "react";
import Image from "next/image";
import Link from "next/link";

const tableTabs = ["revenue", "users", "investment"];

const Leaderboard = ({ leaderboardData, activeCriteria }: any) => {
  const topThree = leaderboardData.leaderboard.slice(0, 3);
  const criteriaMap = {
    revenue: "Revenue",
    users: "Users",
    investment: "Investment"
  };

  const getBadgeSrc = (rank: number) => {
    switch (rank) {
      case 1: return "/images/icons/badge_gold-tq-r_sbf.svg";
      case 2: return "/images/icons/badge_silver-DFF-h3F9.svg";
      case 3: return "/images/icons/badge_bronze.svg";
      default: return "/images/icons/badge_default.svg";
    }
  };

  const getValue = (entry: any) => {
    switch (activeCriteria) {
      case 'revenue': return `RS${entry.revenue}`;
      case 'users': return entry.userCount;
      case 'investment': return `RS${entry.totalInvestment}`;
      default: return `RS${entry.revenue}`;
    }
  };

  return (
    <div className="dashboard-design-main">
      <div className="leaderboard-row">
        {[2, 1, 3].map((position) => (
          topThree[position - 1] && (
            <div
              key={position}
              className={`leaderboard-col leaderboard-col-${position === 1 ? 'two' : position === 2 ? 'one' : 'three'}`}
              style={{ background: position === 1 
                ? "linear-gradient(0deg, #fff 50%, rgba(228, 232, 43, 0.58) 100%)"
                : position === 2
                ? "linear-gradient(0deg, #fff 50%, rgba(85, 207, 245, 0.4) 100%)"
                : "linear-gradient(0deg, #fff 50%, rgba(67, 137, 34, 0.533) 100%)"
              }}
            >
              <div className="leaderboard-numbers">
                {position}<span className="leaderboard-number-text">
                  {position === 1 ? 'st' : position === 2 ? 'nd' : 'rd'}
                </span>
              </div>
              <div className="leaderboard-col-inner">
                <div className="leaderboard-col-icon-row flex items-center">
                  <div>
                    <Image
                      className="leaderboard-icon"
                      src={getBadgeSrc(position)}
                      alt={`${position} place`}
                      width={50}
                      height={50}
                    />
                    <div className="leaderboard-icon-sale">
                        <div className="leaderboard-sale-text">sell</div>
                    </div>
                  </div>                  
                  <div className="leaderboard-title-head">
                    <div className="leaderboard-title">
                      {topThree[position - 1].name}
                    </div>
                    <div className="leaderboard-countery"><span>🇨🇺</span></div>
                  </div>
                </div>               
                <div className="leaderboard-hr-info">
                    <div>
                        <div className="leaderboard-hr-text">Total User</div>
                        <div className="leaderboard-hr-text-small"> </div>
                    </div>
                    <div className="leaderboard-hr-price-col">
                        <div className="leaderboard-hr-info-green">{topThree[position - 1].userCount}</div>
                        <div className="leaderboard-hr-info-grey"></div>
                    </div>
                </div>
                <div className="leaderboard-hr-info">
                  <div className="flex flex-col justify-end">
                      <div className="leaderboard-hr-text-bold"> Rs.{topThree[position - 1].revenue}</div>
                      <div className="leaderboard-hr-text-small">Revenue</div>
                  </div>
                  <div className="flex flex-col justify-end">
                      <div className="leaderboard-hr-text-bold">Rs.{topThree[position - 1].totalInvestment}</div>
                      <div className="leaderboard-hr-text-small">Investment</div>
                  </div>
                </div>
              </div>
            </div>
          )
        ))}
      </div>

      <div className="table-box-wrapper">
        <div className="table-box-main">
          <h3 className="table-box-title-head">Leaderboard Table</h3>
          <div className="table-price-box-tab-row">
            {tableTabs.map((tab) => (
              <Link
                key={tab}
                href={`/leaderboard?criteria=${tab}`}
                passHref
              >
                <button className={`table-price-box-tab ${
                  activeCriteria === tab ? 'bg-blue-100' : ''
                }`}>
                  {criteriaMap[tab as keyof typeof criteriaMap]}
                </button>
              </Link>
            ))}
          </div>
          <table className="leaderboard-table">
            <thead>
              <tr className="table-tab-head">
                <th>#</th>
                <th>Name</th>
                <th>Revenue</th>
                <th>Users</th>
                <th>Investment</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.leaderboard.map((entry: any) => (
                <tr key={entry.employeeId} className="table-row-line-main">
                  <td className="table-col-number">{entry.rank}</td>
                  <td>
                    <div className="table-col-line-main">
                      <Image
                        src={getBadgeSrc(entry.rank)}
                        alt="Badge"
                        width={40}
                        height={40}
                        className="table-col-icon mr-2 w-14"
                      />
                      <div className="table-col-bold-title">{entry.name}</div>
                    </div>
                  </td>
                  <td className="table-col-price-black">Rs{entry.revenue}</td>
                  <td className="table-col-price-green">{entry.userCount}</td>
                  <td className="table-col-price-green">
                    Rs{entry.totalInvestment}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;