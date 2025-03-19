import React from "react";
import Image from "next/image";

const tableData = [
  {
    number: 1,
    badgeSrc: "images/icons/badge_default-BnYBitWr.svg",
    userName: "Miguel F",
    countryCode: "🇪🇸",
    accountSize: "$5,000",
    profit: "$1,100.05",
    profitPercentage: "22.00%",
  },
];

const tableTabs = ["All", "$5,000", "$10,000", "$25,000", "$50,000", "$100,000"];

const Leaderboard = () => {
  return (
    <div className="dashboard-design-main">
      <div className="leaderboard-row">
        {/* 2nd Place */}
        <div
          className="leaderboard-col leaderboard-col-one"
          style={{
            background:
              "linear-gradient(0deg, rgb(255, 255, 255) 50%, rgba(85, 207, 245, 0.4) 100%, rgb(255, 255, 255) 100%)",
          }}
        >
          <div className="leaderboard-numbers">
            2<span className="leaderboard-number-text">nd</span>
          </div>
          <div className="leaderboard-col-inner">
            <div className="leaderboard-col-icon-row flex items-center">
              <Image
                className="leaderboard-icon"
                src="images/icons/badge_silver-DFF-h3F9.svg"
                alt="Silver Badge"
                width={50}
                height={50}
              />
              <div className="leaderboard-title-head">
                <div className="leaderboard-title">Rafael Ernesto V</div>
                <div className="leaderboard-country">🇨🇺</div>
              </div>
            </div>
            <div className="leaderboard-hr-info">
              <div>
                <div className="leaderboard-hr-text">XRPUSD</div>
                <div className="leaderboard-hr-text-small">3 days ago</div>
              </div>
              <div className="leaderboard-hr-price-col">
                <div className="leaderboard-hr-info-green">$21,467.4</div>
                <div className="leaderboard-hr-info-grey">$100,000</div>
              </div>
            </div>
          </div>
        </div>

        {/* 1st Place */}
        <div
          className="leaderboard-col leaderboard-col-two"
          style={{
            background:
              "linear-gradient(0deg, rgb(255, 255, 255) 50%, rgba(228, 232, 43, 0.58) 100%, rgb(255, 255, 255) 100%)",
          }}
        >
          <div className="leaderboard-numbers">
            1<span className="leaderboard-number-text">st</span>
          </div>
          <div className="leaderboard-col-inner">
            <div className="leaderboard-col-icon-row flex items-center">
              <Image
                className="leaderboard-icon"
                src="images/icons/badge_gold-tq-r_sbf.svg"
                alt="Gold Badge"
                width={50}
                height={50}
              />
              <div className="leaderboard-title-head">
                <div className="leaderboard-title">MUXAMMAD N</div>
                <div className="leaderboard-country">🇺🇿</div>
              </div>
            </div>
            <div className="leaderboard-hr-info">
              <div>
                <div className="leaderboard-hr-text">XAUUSD</div>
                <div className="leaderboard-hr-text-small">20 hours ago</div>
              </div>
              <div className="leaderboard-hr-price-col">
                <div className="leaderboard-hr-info-green">$26,628</div>
                <div className="leaderboard-hr-info-grey">$100,000</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3rd Place */}
        <div
          className="leaderboard-col leaderboard-col-three"
          style={{
            background:
              "linear-gradient(0deg, rgb(255, 255, 255) 50%, rgba(67, 137, 34, 0.533) 100%, rgb(255, 255, 255) 100%)",
          }}
        >
          <div className="leaderboard-numbers">
            3<span className="leaderboard-number-text">rd</span>
          </div>
          <div className="leaderboard-col-inner">
            <div className="leaderboard-col-icon-row flex items-center">
              <Image
                className="leaderboard-icon"
                src="images/icons/badge_default-BnYBitWr.svg"
                alt="Bronze Badge"
                width={50}
                height={50}
              />
              <div className="leaderboard-title-head">
                <div className="leaderboard-title">SIROJIDDIN T</div>
                <div className="leaderboard-country">🇺🇿</div>
              </div>
            </div>
            <div className="leaderboard-hr-info">
              <div>
                <div className="leaderboard-hr-text">XAUUSD</div>
                <div className="leaderboard-hr-text-small">2 days ago</div>
              </div>
              <div className="leaderboard-hr-price-col">
                <div className="leaderboard-hr-info-green">$14,581</div>
                <div className="leaderboard-hr-info-grey">$100,000</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="table-box-wrapper">
        <div className="table-box-main">
          <h3 className="table-box-title-head">Leaderboard Table</h3>
            <div className="table-price-box-tab-row">
                {tableTabs.map((tab, index) => (
                <button key={index} className="table-price-box-tab">
                    {tab}
                </button>
                ))}
            </div>
          <table className="leaderboard-table">
            <thead>
              <tr className="table-tab-head">
                <th>#</th>                
                <th>Name</th>
                <th>Account Size</th>
                <th>Profit</th>
                <th>Profit %</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr key={index} className="table-row-line-main">
                  <td className="table-col-number">{row.number}</td>
                  <td>
                  <div className="table-col-line-main">
                        <Image src={row.badgeSrc} alt="Badge" width={40} height={40} className="table-col-icon mr-2 w-14" />
                        <div className="table-col-bold-title">{row.userName}</div>
                        <div className="table-col-small-text">
                            <span role="img">{row.countryCode}</span>
                        </div>
                    </div>
                  </td>
                  <td className="table-col-price-black">{row.accountSize}</td>
                  <td className="table-col-price-green">
                        <svg className="mr-1 h-6 w-6" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                         xmlns="http://www.w3.org/2000/svg">
                            <path 
                            fillRule="evenodd" 
                            d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" 
                            clipRule="evenodd" />  
                        </svg>
                    {row.profit}</td>
                  <td className="table-col-price-green">
                        <svg className="mr-1 h-6 w-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path 
                            fillRule="evenodd" 
                            d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                            clipRule="evenodd"/>
                        </svg>
                    {row.profitPercentage}
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
