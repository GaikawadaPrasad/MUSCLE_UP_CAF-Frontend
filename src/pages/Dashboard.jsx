import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FaRupeeSign, FaShoppingCart, FaCrown, FaCapsules, FaAppleAlt, FaPercent, FaCoins, FaCreditCard, FaMobileAlt, FaClock } from 'react-icons/fa';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

// Register ChartJS plugins
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const { dashboardData, fetchDashboardStats, loading } = useApp();

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  const stats = dashboardData?.todayStats || {
    revenue: 0,
    orders: 0,
    bestSellingItem: 'None',
    supplementsSold: 0,
    foodSales: 0,
    averageOrderValue: 0
  };

  const paymentBreakdown = dashboardData?.paymentBreakdown || {
    Cash: 0,
    UPI: 0,
    Card: 0,
    Other: 0
  };

  const topFiveItems = dashboardData?.topFiveItems || [];
  const recentSales = dashboardData?.recentSales || [];
  const weeklyChart = dashboardData?.weeklyChart || [];

  // Line Chart Config
  const lineChartData = {
    labels: weeklyChart.map(day => day.displayDate),
    datasets: [
      {
        label: 'Revenue (₹)',
        data: weeklyChart.map(day => day.revenue),
        borderColor: '#22C55E', // emeraldGreen
        backgroundColor: 'rgba(34, 197, 94, 0.06)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#16A34A', // emeraldGreenHover
        pointHoverRadius: 8
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#0B1220', // darknavy
        titleColor: '#fff',
        bodyColor: '#f3f4f6',
        borderColor: '#1e293b',
        borderWidth: 1,
        callbacks: {
          label: (context) => ` ₹${context.parsed.y.toLocaleString('en-IN')}`
        }
      }
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          color: '#6B7280', // secondaryTxt
          font: {
            family: 'Outfit'
          },
          callback: (value) => `₹${value}`
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6B7280', // secondaryTxt
          font: {
            family: 'Outfit'
          }
        }
      }
    }
  };

  // Doughnut Chart Config
  const doughnutChartData = {
    labels: Object.keys(paymentBreakdown),
    datasets: [
      {
        data: Object.values(paymentBreakdown),
        backgroundColor: [
          '#f59e0b', // Cash
          '#22C55E', // UPI - emeraldGreen
          '#3b82f6', // Card
          '#9CA3AF'  // Other - mutedTxt
        ],
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#111827', // primaryTxt
          padding: 15,
          font: {
            family: 'Outfit',
            size: 11
          }
        }
      },
      tooltip: {
        backgroundColor: '#0B1220', // darknavy
        titleColor: '#fff',
        bodyColor: '#f3f4f6',
        borderColor: '#1e293b',
        borderWidth: 1,
        callbacks: {
          label: (context) => ` ₹${context.parsed.toLocaleString('en-IN')}`
        }
      }
    },
    cutout: '70%'
  };

  const paymentIcons = {
    Cash: <FaCoins className="text-amber-500" />,
    UPI: <FaMobileAlt className="text-emeraldGreen" />,
    Card: <FaCreditCard className="text-blue-500" />,
    Other: <FaPercent className="text-slate-400" />
  };

  return (
    <div className="space-y-6 text-primaryTxt">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-darknavy border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden text-white">
        <div className="absolute right-0 top-0 w-32 h-32 bg-emeraldGreen/10 rounded-full blur-2xl"></div>
        <div className="space-y-1 relative z-10">
          <h2 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">
            Welcome Back, Staff
          </h2>
          <p className="text-sm text-slate-300">
            Track daily sales, register orders, and manage cafe operations.
          </p>
        </div>
        <button
          onClick={fetchDashboardStats}
          className="mt-4 md:mt-0 px-5 py-2.5 bg-emeraldGreen hover:bg-emeraldGreenHover text-sm font-semibold rounded-xl text-white shadow-md shadow-emeraldGreen/10 transition-all duration-200"
        >
          Sync Data
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Today's Sales */}
        <div className="bg-cardBg border border-borderCol rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:border-emeraldGreen/30 transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-secondaryTxt font-semibold tracking-wider uppercase">Today's Sales</span>
            <div className="bg-emeraldGreen/10 text-emeraldGreen p-2 rounded-xl">
              <FaRupeeSign className="text-sm" />
            </div>
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-black text-primaryTxt">₹{stats.revenue.toLocaleString('en-IN')}</h3>
            <p className="text-[10px] text-emeraldGreen font-semibold mt-1">Live metrics</p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-cardBg border border-borderCol rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:border-emeraldGreen/30 transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-secondaryTxt font-semibold tracking-wider uppercase">Total Orders</span>
            <div className="bg-blue-500/10 text-blue-500 p-2 rounded-xl">
              <FaShoppingCart className="text-sm" />
            </div>
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-black text-primaryTxt">{stats.orders}</h3>
            <p className="text-[10px] text-secondaryTxt mt-1">Orders checked out</p>
          </div>
        </div>

        {/* Supplements Sold */}
        <div className="bg-cardBg border border-borderCol rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:border-emeraldGreen/30 transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-secondaryTxt font-semibold tracking-wider uppercase">Supplements Sold</span>
            <div className="bg-purple-500/10 text-purple-500 p-2 rounded-xl">
              <FaCapsules className="text-sm" />
            </div>
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-black text-primaryTxt">{stats.supplementsSold}</h3>
            <p className="text-[10px] text-secondaryTxt mt-1">Containers / packs</p>
          </div>
        </div>

        {/* Food Sales */}
        <div className="bg-cardBg border border-borderCol rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:border-emeraldGreen/30 transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-secondaryTxt font-semibold tracking-wider uppercase">Food Sales</span>
            <div className="bg-emeraldGreen/10 text-emeraldGreen p-2 rounded-xl">
              <FaAppleAlt className="text-sm" />
            </div>
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-black text-primaryTxt">₹{stats.foodSales.toLocaleString('en-IN')}</h3>
            <p className="text-[10px] text-secondaryTxt mt-1">Kitchen revenue</p>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-cardBg border border-borderCol rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:border-emeraldGreen/30 transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-secondaryTxt font-semibold tracking-wider uppercase">Avg. Order Value</span>
            <div className="bg-indigo-500/10 text-indigo-500 p-2 rounded-xl">
              <FaPercent className="text-sm" />
            </div>
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-black text-primaryTxt">₹{stats.averageOrderValue.toLocaleString('en-IN')}</h3>
            <p className="text-[10px] text-secondaryTxt mt-1">Average per customer</p>
          </div>
        </div>

        {/* Best Selling Item */}
        <div className="bg-cardBg border border-borderCol rounded-2xl p-4 shadow-sm flex flex-col justify-between col-span-2 md:col-span-1 hover:border-emeraldGreen/30 transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-secondaryTxt font-semibold tracking-wider uppercase">Best Seller</span>
            <div className="bg-amber-500/10 text-amber-500 p-2 rounded-xl">
              <FaCrown className="text-sm" />
            </div>
          </div>
          <div>
            <h3 className="text-sm md:text-base font-bold text-primaryTxt line-clamp-1">{stats.bestSellingItem}</h3>
            <p className="text-[10px] text-amber-500 font-semibold mt-1">Top chosen product</p>
          </div>
        </div>
      </div>

      {/* Main Charts & Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart (Last 7 Days) */}
        <div className="bg-cardBg border border-borderCol rounded-3xl p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-base font-extrabold text-primaryTxt">Sales Revenue Trend</h4>
              <p className="text-xs text-secondaryTxt">Total daily sales over the last 7 days</p>
            </div>
            <span className="text-xs bg-lightgraySec text-secondaryTxt font-semibold px-3 py-1 rounded-full border border-borderCol">
              Weekly
            </span>
          </div>
          <div className="h-64 relative">
            {weeklyChart.length > 0 ? (
              <Line data={lineChartData} options={lineChartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-secondaryTxt text-sm">
                No chart data available
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-cardBg border border-borderCol rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-base font-extrabold text-primaryTxt mb-1">Payment Breakdown</h4>
            <p className="text-xs text-secondaryTxt mb-6">Sales breakdown by payment modes</p>
          </div>
          
          <div className="relative h-44 flex items-center justify-center">
            {Object.values(paymentBreakdown).some(val => val > 0) ? (
              <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
            ) : (
              <div className="flex flex-col items-center justify-center text-secondaryTxt text-sm">
                <span className="text-xl">📊</span>
                <span className="mt-1">No sales recorded today</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            {Object.entries(paymentBreakdown).map(([mode, amt]) => (
              <div key={mode} className="bg-lightgraySec/60 p-2.5 rounded-xl border border-borderCol flex items-center space-x-2.5">
                <div className="p-2 bg-whiteBg rounded-lg text-sm flex items-center justify-center shadow-sm">
                  {paymentIcons[mode] || paymentIcons.Other}
                </div>
                <div>
                  <p className="text-[10px] text-secondaryTxt font-semibold tracking-wide uppercase">{mode}</p>
                  <p className="text-xs font-bold text-primaryTxt">₹{amt.toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top 5 Products & Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Selling Products */}
        <div className="bg-cardBg border border-borderCol rounded-3xl p-5 shadow-sm">
          <h4 className="text-base font-extrabold text-primaryTxt mb-1">Top 5 Selling Items</h4>
          <p className="text-xs text-secondaryTxt mb-6">Based on overall quantity sold</p>
          
          <div className="space-y-4">
            {topFiveItems.length > 0 ? (
              topFiveItems.map((item, idx) => {
                const maxQty = topFiveItems[0].quantity || 1;
                const percentage = Math.round((item.quantity / maxQty) * 100);
                
                return (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-primaryTxt line-clamp-1">{idx + 1}. {item.name}</span>
                      <span className="text-xs font-bold text-secondaryTxt">
                        {item.quantity} units <span className="text-borderCol">|</span> <span className="text-emeraldGreen">₹{item.revenue.toLocaleString('en-IN')}</span>
                      </span>
                    </div>
                    <div className="w-full bg-lightgraySec h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emeraldGreen h-2.5 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-secondaryTxt text-sm">
                No items sold yet.
              </div>
            )}
          </div>
        </div>

        {/* Recent Sales Activity */}
        <div className="bg-cardBg border border-borderCol rounded-3xl p-5 shadow-sm">
          <h4 className="text-base font-extrabold text-primaryTxt mb-1">Recent Activity</h4>
          <p className="text-xs text-secondaryTxt mb-6">Recent transactions across the system</p>

          <div className="divide-y divide-borderCol">
            {recentSales.length > 0 ? (
              recentSales.map((sale) => (
                <div key={sale._id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-xl font-bold text-xs ${
                      sale.category === 'Supplement' 
                        ? 'bg-purple-50 text-purple-650' 
                        : 'bg-emerald-50 text-emeraldGreen'
                    }`}>
                      {sale.category === 'Supplement' ? 'SUP' : 'FOD'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-primaryTxt line-clamp-1">
                        {sale.productName}
                      </p>
                      <div className="flex items-center text-xs text-secondaryTxt space-x-2 mt-0.5">
                        <span>Qty: {sale.quantity}</span>
                        <span>•</span>
                        {sale.packSize && (
                          <>
                            <span>{sale.packSize}</span>
                            <span>•</span>
                          </>
                        )}
                        <span className="flex items-center">
                          <FaClock className="mr-1 text-[10px]" />
                          {sale.time}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primaryTxt">₹{sale.totalAmount}</p>
                    <p className="text-[10px] font-semibold text-emeraldGreen">{sale.paymentMode}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-secondaryTxt text-sm">
                No transactions recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
