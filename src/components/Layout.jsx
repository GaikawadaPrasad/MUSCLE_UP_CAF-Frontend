import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChartBar, FaCalculator, FaCoffee, FaFileInvoiceDollar } from 'react-icons/fa';

const Layout = ({ children }) => {
  const location = useLocation();

  const navigationItems = [
    { name: 'Dashboard', path: '/', icon: FaChartBar },
    { name: 'Billing', path: '/billing', icon: FaCalculator },
    { name: 'Products', path: '/products', icon: FaCoffee },
    { name: 'Reports', path: '/reports', icon: FaFileInvoiceDollar }
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-lightgraySec text-primaryTxt flex flex-col pb-20 md:pb-0">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-darknavy backdrop-blur-md border-b border-slate-800/80 shadow-lg px-4 py-3 md:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-emeraldGreen text-whiteBg p-2 rounded-xl font-bold shadow-md shadow-emeraldGreen/20">
              <span className="text-xl">💪</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white md:text-xl">
                MUSCLE UP <span className="text-emeraldGreen">CAFÉ</span>
              </h1>
              <p className="text-xs text-slate-450 font-medium">Billing & Sales Control</p>
            </div>
          </div>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-emeraldGreen text-whiteBg shadow-md shadow-emeraldGreen/20'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="text-base" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
          {/* Quick Date display on top header */}
          <div className="text-right text-xs md:text-sm text-slate-450 font-medium">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            })}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8 overflow-x-hidden">
        {children}
      </main>

      {/* Mobile Bottom Tab Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-darknavy border-t border-slate-800/80 shadow-2xl px-4 py-2 flex items-center justify-around">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center w-16 py-1 rounded-xl transition-all duration-150 ${
                active
                  ? 'text-emeraldGreen font-semibold scale-105'
                  : 'text-slate-400 hover:text-slate-205'
              }`}
            >
              <Icon className={`text-xl mb-1 ${active ? 'text-emeraldGreen' : 'text-slate-450'}`} />
              <span className="text-[10px] tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;
