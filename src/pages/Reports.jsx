import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { format, subDays } from 'date-fns';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FaCalendarAlt, FaFilePdf, FaRupeeSign, FaShoppingCart, FaCoins, FaMobileAlt, FaCreditCard, FaCrown, FaAppleAlt, FaCapsules, FaArrowUp, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Reports = () => {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  // Filter selection state
  const [filterType, setFilterType] = useState('today'); // today, yesterday, custom, range
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);

  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  // Fetch report data based on current inputs
  const fetchReport = async () => {
    setLoading(true);
    try {
      let url = '/reports/today';

      if (filterType === 'yesterday') {
        url = `/reports/date/${yesterdayStr}`;
      } else if (filterType === 'custom') {
        url = `/reports/date/${startDate}`;
      } else if (filterType === 'range') {
        url = `/reports/range?startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await api.get(url);
      if (response.data.success) {
        setReportData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  // Trigger report fetch when filters change
  useEffect(() => {
    fetchReport();
  }, [filterType, startDate, endDate]);

  const handleFilterSelect = (type) => {
    setFilterType(type);
    if (type === 'today') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (type === 'yesterday') {
      setStartDate(yesterdayStr);
      setEndDate(yesterdayStr);
    }
  };

  const generatePDF = () => {
    if (!reportData || reportData.sales.length === 0) {
      toast.error('No sales data available to download');
      return;
    }

    try {
      const doc = new jsPDF();
      const { summary, sales } = reportData;

      // Color Palette (Dark Theme / Sleek Green Accent)
      const primaryColor = [15, 23, 42]; // slate-900 (#0f172a)
      const accentColor = [108, 142, 64]; // brand-500 (#6c8e40)
      const textColor = [51, 65, 85]; // slate-700

      // Page setup
      const pageWidth = doc.internal.pageSize.width;

      // Header Banner
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 40, 'F');

      // Accent line
      doc.setFillColor(...accentColor);
      doc.rect(0, 40, pageWidth, 2, 'F');

      // Title & Branding
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('MUSCLE UP CAFÉ', 15, 18);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('Internal Sales & Billing Report Management', 15, 25);
      const periodLabel = filterType === 'range'
        ? `Report Period: RANGE (${startDate} to ${endDate})`
        : `Report Period: ${filterType.toUpperCase()} (${startDate})`;
      doc.text(periodLabel, 15, 32);

      // Metadata Info Box (Right Side Header)
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Generated on: ${format(new Date(), 'PPpp')}`, pageWidth - 15, 20, { align: 'right' });
      doc.text('Staff Terminal ID: #01', pageWidth - 15, 26, { align: 'right' });

      // Summary Section Header
      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Sales Summary Metrics', 15, 52);

      // Draw Summary Cards (Grid of values)
      // Card 1: Revenue
      doc.setFillColor(248, 250, 252); // light slate background
      doc.rect(15, 58, 55, 28, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(15, 58, 55, 28, 'D');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('TOTAL REVENUE', 20, 65);
      doc.setFontSize(13);
      doc.setTextColor(...accentColor);
      doc.text(`INR ${summary.totalSales.toLocaleString('en-IN')}`, 20, 77);

      // Card 2: Orders
      doc.setFillColor(248, 250, 252);
      doc.rect(78, 58, 55, 28, 'F');
      doc.rect(78, 58, 55, 28, 'D');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('TOTAL ORDERS', 83, 65);
      doc.setFontSize(14);
      doc.setTextColor(...primaryColor);
      doc.text(`${summary.totalOrders}`, 83, 77);

      // Card 3: AOV
      doc.setFillColor(248, 250, 252);
      doc.rect(140, 58, 55, 28, 'F');
      doc.rect(140, 58, 55, 28, 'D');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('AVERAGE ORDER VALUE', 145, 65);
      doc.setFontSize(13);
      doc.setTextColor(...primaryColor);
      doc.text(`INR ${summary.averageOrderValue.toLocaleString('en-IN')}`, 145, 77);

      // Secondary Summary: Category & Payments
      doc.setFontSize(11);
      doc.setTextColor(...primaryColor);
      doc.text('Category Breakdown', 15, 98);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textColor);
      doc.text(`Food Sales: INR ${summary.categoryBreakdown.Food.toLocaleString('en-IN')}`, 15, 105);
      doc.text(`Supplement Sales: INR ${summary.categoryBreakdown.Supplement.toLocaleString('en-IN')}`, 15, 110);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...primaryColor);
      doc.text('Payment Methods', 90, 98);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textColor);
      doc.text(`UPI: INR ${summary.paymentBreakdown.UPI.toLocaleString('en-IN')}`, 90, 105);
      doc.text(`Cash: INR ${summary.paymentBreakdown.Cash.toLocaleString('en-IN')}`, 90, 110);
      doc.text(`Card: INR ${summary.paymentBreakdown.Card.toLocaleString('en-IN')}`, 90, 115);
      doc.text(`Other: INR ${summary.paymentBreakdown.Other.toLocaleString('en-IN')}`, 90, 120);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...primaryColor);
      doc.text('Top Performer', 140, 98);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textColor);
      doc.text(`Best Seller:`, 140, 105);
      doc.setFont('helvetica', 'bold');
      doc.text(`${summary.bestSellingProduct}`, 140, 111, { maxWidth: 55 });

      // Detailed Transactions Header
      doc.setFontSize(13);
      doc.setTextColor(...primaryColor);
      doc.text('Detailed Sales Records', 15, 134);

      // Generate Table Rows
      const tableRows = sales.map((sale, idx) => {
        const productDetails = sale.category === 'Supplement'
          ? `${sale.productName} (${sale.packSize} / ${sale.flavor})`
          : sale.productName;
        const customer = sale.customerName
          ? `${sale.customerName} (${sale.phone})`
          : 'Walk-in';

        return [
          idx + 1,
          sale.date,
          sale.time,
          productDetails,
          sale.quantity,
          `INR ${sale.unitPrice}`,
          `INR ${sale.discount || 0}`,
          `INR ${sale.totalAmount}`,
          sale.paymentMode,
          customer
        ];
      });

      // Render Table
      autoTable(doc, {
        startY: 140,
        head: [['S.No', 'Date', 'Time', 'Item Details', 'Qty', 'Unit Price', 'Discount', 'Amount', 'Payment', 'Customer']],
        body: tableRows,
        theme: 'striped',
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: 'bold',
          halign: 'left'
        },
        bodyStyles: {
          fontSize: 8,
          textColor: textColor
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 18 },
          2: { cellWidth: 13 },
          3: { cellWidth: 50 },
          4: { cellWidth: 10, halign: 'center' },
          5: { cellWidth: 20 },
          6: { cellWidth: 20, fontStyle: 'bold' },
          7: { cellWidth: 18 },
          8: { cellWidth: 35 }
        },
        didDrawPage: (data) => {
          // Footer on each page
          const str = `Page ${doc.internal.getNumberOfPages()}`;
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text(str, pageWidth - 15, doc.internal.pageSize.height - 10, { align: 'right' });
          doc.text('MUSCLE UP CAFE - Confidential Internal Staff Operations Only', 15, doc.internal.pageSize.height - 10);
        }
      });

      // Save PDF file
      const filename = filterType === 'range'
        ? `sales_report_${startDate}_to_${endDate}.pdf`
        : `sales_report_${startDate}.pdf`;
      doc.save(filename);
      toast.success('Report PDF generated successfully!');
    } catch (err) {
      console.error('Error generating PDF:', err);
      toast.error('Could not generate PDF report');
    }
  };

  const summary = reportData?.summary || {
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    paymentBreakdown: { Cash: 0, UPI: 0, Card: 0, Other: 0 },
    categoryBreakdown: { Food: 0, Supplement: 0 },
    bestSellingProduct: 'None'
  };

  const sales = reportData?.sales || [];
  return (
    <div className="space-y-6 text-primaryTxt">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-cardBg border border-borderCol rounded-3xl p-6 shadow-sm gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-primaryTxt md:text-2xl font-sans">Daily & Period Reports</h2>
          <p className="text-xs text-secondaryTxt">Generate, evaluate, and export professional PDF sales invoices and summaries.</p>
        </div>
        <button
          onClick={generatePDF}
          disabled={sales.length === 0}
          className={`px-5 py-2.5 rounded-xl font-black text-xs shadow-lg flex items-center justify-center space-x-2 transition-all duration-200 ${sales.length > 0
              ? 'bg-emeraldGreen hover:bg-emeraldGreenHover text-whiteBg shadow-md shadow-emeraldGreen/10'
              : 'bg-lightgraySec text-mutedTxt cursor-not-allowed border border-borderCol'
            }`}
        >
          <FaFilePdf className="text-sm" />
          <span>DOWNLOAD REPORT PDF</span>
        </button>
      </div>

      {/* Report Filter Controls */}
      <div className="bg-cardBg border border-borderCol rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-2 border-b border-borderCol pb-3.5">
          {[
            { id: 'today', name: 'Today' },
            { id: 'yesterday', name: 'Yesterday' },
            { id: 'custom', name: 'Single Day' },
            { id: 'range', name: 'Date Range' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleFilterSelect(item.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${filterType === item.id
                  ? 'bg-emeraldGreen text-whiteBg font-black shadow-md'
                  : 'text-secondaryTxt bg-whiteBg border border-borderCol hover:bg-lightgraySec'
                }`}
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* Date Inputs */}
        {(filterType === 'custom' || filterType === 'range') && (
          <div className="flex flex-wrap gap-4 items-center bg-lightgraySec/50 p-4 rounded-2xl border border-borderCol">
            <div className="flex items-center space-x-2.5">
              <FaCalendarAlt className="text-emeraldGreen text-sm" />
              <div className="space-y-1">
                <span className="text-[10px] text-secondaryTxt font-bold uppercase tracking-wider block">
                  {filterType === 'range' ? 'Start Date' : 'Target Date'}
                </span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-whiteBg border border-borderCol rounded-xl px-3 py-1.5 text-xs text-primaryTxt font-semibold focus:border-emeraldGreen focus:ring-0 focus:outline-none"
                />
              </div>
            </div>

            {filterType === 'range' && (
              <div className="flex items-center space-x-2.5">
                <FaCalendarAlt className="text-emeraldGreen text-sm" />
                <div className="space-y-1">
                  <span className="text-[10px] text-secondaryTxt font-bold uppercase tracking-wider block">
                    End Date
                  </span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-whiteBg border border-borderCol rounded-xl px-3 py-1.5 text-xs text-primaryTxt font-semibold focus:border-emeraldGreen focus:ring-0 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <button
              onClick={fetchReport}
              className="mt-4 sm:mt-0 px-4 py-2 bg-emeraldGreen hover:bg-emeraldGreenHover text-xs font-bold rounded-xl text-whiteBg shadow-sm transition-colors"
            >
              Apply Filter
            </button>
          </div>
        )}
      </div>

      {/* Metrics Dashboard */}
      {loading ? (
        <div className="flex items-center justify-center py-16 bg-cardBg border border-borderCol rounded-3xl">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emeraldGreen"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 text-primaryTxt">
            <div className="bg-cardBg border border-borderCol rounded-2xl p-4 flex flex-col justify-between shadow-sm">
              <span className="text-[10px] text-secondaryTxt font-bold tracking-wider uppercase">Period Sales</span>
              <h4 className="text-lg md:text-xl font-black text-primaryTxt mt-2">
                ₹{summary.totalSales.toLocaleString('en-IN')}
              </h4>
            </div>
            <div className="bg-cardBg border border-borderCol rounded-2xl p-4 flex flex-col justify-between shadow-sm">
              <span className="text-[10px] text-secondaryTxt font-bold tracking-wider uppercase">Total Orders</span>
              <h4 className="text-lg md:text-xl font-black text-primaryTxt mt-2">
                {summary.totalOrders}
              </h4>
            </div>
            <div className="bg-cardBg border border-borderCol rounded-2xl p-4 flex flex-col justify-between shadow-sm">
              <span className="text-[10px] text-secondaryTxt font-bold tracking-wider uppercase">Average Ticket</span>
              <h4 className="text-lg md:text-xl font-black text-primaryTxt mt-2">
                ₹{summary.averageOrderValue.toLocaleString('en-IN')}
              </h4>
            </div>
            <div className="bg-cardBg border border-borderCol rounded-2xl p-4 flex flex-col justify-between shadow-sm">
              <span className="text-[10px] text-secondaryTxt font-bold tracking-wider uppercase">Food Sales</span>
              <h4 className="text-lg md:text-xl font-black text-primaryTxt mt-2">
                ₹{summary.categoryBreakdown.Food.toLocaleString('en-IN')}
              </h4>
            </div>
            <div className="bg-cardBg border border-borderCol rounded-2xl p-4 flex flex-col justify-between shadow-sm">
              <span className="text-[10px] text-secondaryTxt font-bold tracking-wider uppercase">Supplements</span>
              <h4 className="text-lg md:text-xl font-black text-primaryTxt mt-2">
                ₹{summary.categoryBreakdown.Supplement.toLocaleString('en-IN')}
              </h4>
            </div>
            <div className="bg-cardBg border border-borderCol rounded-2xl p-4 flex flex-col justify-between shadow-sm">
              <span className="text-[10px] text-secondaryTxt font-bold tracking-wider uppercase">Best Seller</span>
              <h4 className="text-xs font-bold text-primaryTxt mt-2 line-clamp-2" title={summary.bestSellingProduct}>
                {summary.bestSellingProduct}
              </h4>
            </div>
          </div>

          {/* Payment Breakdown Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-primaryTxt">
            <div className="bg-cardBg border border-borderCol p-3 rounded-2xl flex items-center space-x-3 shadow-sm">
              <div className="bg-emeraldGreen/10 text-emeraldGreen p-2.5 rounded-xl text-sm"><FaMobileAlt /></div>
              <div>
                <span className="text-[9px] text-secondaryTxt font-bold uppercase tracking-wider block">UPI</span>
                <span className="text-sm font-bold text-primaryTxt">₹{summary.paymentBreakdown.UPI.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="bg-cardBg border border-borderCol p-3 rounded-2xl flex items-center space-x-3 shadow-sm">
              <div className="bg-amber-50 text-amber-600 p-2.5 rounded-xl text-sm"><FaCoins /></div>
              <div>
                <span className="text-[9px] text-secondaryTxt font-bold uppercase tracking-wider block">Cash</span>
                <span className="text-sm font-bold text-primaryTxt">₹{summary.paymentBreakdown.Cash.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="bg-cardBg border border-borderCol p-3 rounded-2xl flex items-center space-x-3 shadow-sm">
              <div className="bg-blue-50 text-blue-500 p-2.5 rounded-xl text-sm"><FaCreditCard /></div>
              <div>
                <span className="text-[9px] text-secondaryTxt font-bold uppercase tracking-wider block">Card</span>
                <span className="text-sm font-bold text-primaryTxt">₹{summary.paymentBreakdown.Card.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="bg-cardBg border border-borderCol p-3 rounded-2xl flex items-center space-x-3 shadow-sm">
              <div className="bg-slate-50 text-slate-600 p-2.5 rounded-xl text-sm"><FaRupeeSign /></div>
              <div>
                <span className="text-[9px] text-secondaryTxt font-bold uppercase tracking-wider block">Other</span>
                <span className="text-sm font-bold text-primaryTxt">₹{summary.paymentBreakdown.Other.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Detailed Sales Records Table */}
          <div className="bg-cardBg border border-borderCol rounded-3xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-primaryTxt font-sans">Detailed Report Table</h3>
              <p className="text-xs text-secondaryTxt">List of transactions for the selected range</p>
            </div>

            <div className="overflow-x-auto w-full -mx-5 px-5 sm:mx-0 sm:px-0">
              <table className="w-full text-left border-collapse min-w-[700px] text-xs">
                <thead>
                  <tr className="border-b border-borderCol text-secondaryTxt font-semibold bg-lightgraySec/50">
                    <th className="py-3.5 px-4 w-14 text-center">S.No</th>
                    <th className="py-3.5 px-3">Date</th>
                    <th className="py-3.5 px-3">Time</th>
                    <th className="py-3.5 px-4">Item Details</th>
                    <th className="py-3.5 px-3 text-center">Qty</th>
                    <th className="py-3.5 px-3 text-right">Unit Price</th>
                    <th className="py-3.5 px-3 text-right">Discount</th>
                    <th className="py-3.5 px-3 text-right">Amount</th>
                    <th className="py-3.5 px-3 text-center">Payment</th>
                    <th className="py-3.5 px-4">Customer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderCol/60 text-primaryTxt">
                  {sales.length > 0 ? (
                    sales.map((sale, idx) => (
                      <tr key={sale._id} className="hover:bg-lightgraySec/35">
                        <td className="py-3 px-3 text-center text-secondaryTxt">{idx + 1}</td>
                        <td className="py-3 px-3 font-medium text-primaryTxt">{sale.date}</td>
                        <td className="py-3 px-3 text-secondaryTxt">{sale.time}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-primaryTxt">{sale.productName}</div>
                          {sale.category === 'Supplement' && (
                            <div className="text-[10px] text-purple-650 font-bold">
                              {sale.packSize} • {sale.flavor}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-primaryTxt">{sale.quantity}</td>
                        <td className="py-3 px-3 text-right font-medium">₹{sale.unitPrice}</td>
                        <td className="py-3 px-3 text-right font-medium text-red-500">₹{sale.discount || 0}</td>
                        <td className="py-3 px-3 text-right font-bold text-primaryTxt">₹{sale.totalAmount}</td>
                        <td className="py-3 px-3 text-center">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-whiteBg border border-borderCol text-secondaryTxt">
                            {sale.paymentMode}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {sale.customerName ? (
                            <div>
                              <div className="font-semibold text-secondaryTxt">{sale.customerName}</div>
                              {sale.phone && <div className="text-[10px] text-mutedTxt">{sale.phone}</div>}
                            </div>
                          ) : (
                            <span className="text-mutedTxt italic">Walk-in</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="py-12 text-center text-secondaryTxt text-sm">
                        No transactions found for this date range.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
