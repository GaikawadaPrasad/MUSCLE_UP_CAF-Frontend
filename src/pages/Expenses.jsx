import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FaPlus, FaTrash, FaCalendarAlt, FaFileInvoiceDollar, FaRegStickyNote, FaUser, FaInfoCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Expenses = () => {
  const {
    expenses,
    expenseSummary,
    user,
    fetchExpenses,
    addExpense,
    deleteExpense,
    loading
  } = useApp();

  // Selected month filter state (YYYY-MM)
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

  // Form states (Admin only)
  const [itemName, setItemName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Bought');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
  const [notes, setNotes] = useState('');
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  // Fetch expenses when month changes
  useEffect(() => {
    fetchExpenses(selectedMonth);
  }, [selectedMonth, fetchExpenses]);

  // Handle new expense submission
  const handleSubmitExpense = async (e) => {
    e.preventDefault();
    if (!itemName || !amount || !category || !date) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitLoading(true);
    const payload = {
      itemName,
      amount: Number(amount),
      category,
      date,
      notes: notes || ''
    };

    const success = await addExpense(payload);
    if (success) {
      // Clear inputs
      setItemName('');
      setAmount('');
      setCategory('Bought');
      setDate(new Date().toISOString().slice(0, 10));
      setNotes('');
    }
    setIsSubmitLoading(false);
  };

  // Handle delete expense item
  const handleDeleteExpense = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense record?')) {
      await deleteExpense(id, selectedMonth);
    }
  };

  // Helper category style mappings
  const getCategoryBadgeClass = (cat) => {
    switch (cat) {
      case 'Bought':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Leftover':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Rent':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Utilities':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'Salaries':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6 text-primaryTxt">
      
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-cardBg border border-borderCol rounded-3xl p-6 shadow-sm gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-primaryTxt md:text-2xl flex items-center space-x-2">
            <FaFileInvoiceDollar className="text-emeraldGreen text-xl md:text-2xl" />
            <span>Expenses Management</span>
          </h2>
          <p className="text-xs text-secondaryTxt">Log and track café stock, leftover costs, salaries, rent, and utility expenses.</p>
        </div>

        {/* Month Selector Filter */}
        <div className="flex items-center space-x-2 bg-lightgraySec/60 px-3.5 py-2 rounded-2xl border border-borderCol">
          <FaCalendarAlt className="text-emeraldGreen text-xs" />
          <span className="text-[10px] text-secondaryTxt font-bold uppercase tracking-wider">Month:</span>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent border-0 font-extrabold text-xs text-primaryTxt focus:ring-0 focus:outline-none py-0 px-0.5 cursor-pointer"
          />
        </div>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Expense card */}
        <div className="bg-cardBg border border-borderCol rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] text-secondaryTxt font-black tracking-wider uppercase block">Total Spent (Month)</span>
            <span className="text-xl font-black text-emeraldGreen">
              ₹{(expenseSummary?.totalAmount || 0).toLocaleString('en-IN')}
            </span>
          </div>
          <span className="p-3 bg-emerald-50 text-emeraldGreen rounded-2xl text-base"><FaFileInvoiceDollar /></span>
        </div>

        {/* Bought Items sum card */}
        <div className="bg-cardBg border border-borderCol rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] text-secondaryTxt font-black tracking-wider uppercase block">Purchased Stocks</span>
            <span className="text-xl font-black text-blue-600">
              ₹{(expenseSummary?.categoryBreakdown?.Bought || 0).toLocaleString('en-IN')}
            </span>
          </div>
          <span className="p-3 bg-blue-50 text-blue-600 rounded-2xl text-base"><FaFileInvoiceDollar /></span>
        </div>

        {/* Leftovers sum card */}
        <div className="bg-cardBg border border-borderCol rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] text-secondaryTxt font-black tracking-wider uppercase block">Leftovers/Waste Cost</span>
            <span className="text-xl font-black text-amber-600">
              ₹{(expenseSummary?.categoryBreakdown?.Leftover || 0).toLocaleString('en-IN')}
            </span>
          </div>
          <span className="p-3 bg-amber-50 text-amber-600 rounded-2xl text-base"><FaFileInvoiceDollar /></span>
        </div>

        {/* Operational sum card */}
        <div className="bg-cardBg border border-borderCol rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] text-secondaryTxt font-black tracking-wider uppercase block">Fixed & Operating Costs</span>
            <span className="text-xl font-black text-indigo-600">
              ₹{(
                (expenseSummary?.categoryBreakdown?.Rent || 0) +
                (expenseSummary?.categoryBreakdown?.Utilities || 0) +
                (expenseSummary?.categoryBreakdown?.Salaries || 0) +
                (expenseSummary?.categoryBreakdown?.Other || 0)
              ).toLocaleString('en-IN')}
            </span>
          </div>
          <span className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl text-base"><FaFileInvoiceDollar /></span>
        </div>
      </div>

      {/* Main Grid: Form (Admin Only) and Expenses List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Record Expense Form (Admin Only, Col-span 4) */}
        {isAdmin && (
          <div className="bg-cardBg border border-borderCol rounded-3xl p-5 shadow-sm lg:col-span-4 space-y-4">
            <h3 className="text-base font-extrabold text-primaryTxt border-b border-borderCol pb-2 flex items-center space-x-2">
              <FaPlus className="text-emeraldGreen text-xs" />
              <span>Record Expense</span>
            </h3>

            <form onSubmit={handleSubmitExpense} className="space-y-3.5">
              {/* Item Name */}
              <div className="space-y-1">
                <label className="text-[10px] text-secondaryTxt font-bold uppercase tracking-wider">Item Name / Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Milk Packets (5L), Utility bills, etc."
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-whiteBg border border-borderCol focus:border-emeraldGreen focus:ring-1 focus:ring-emeraldGreen rounded-xl text-xs py-2 px-3 text-primaryTxt"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Cost Amount */}
                <div className="space-y-1">
                  <label className="text-[10px] text-secondaryTxt font-bold uppercase tracking-wider">Cost Amount (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="Amount spent"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-whiteBg border border-borderCol focus:border-emeraldGreen focus:ring-1 focus:ring-emeraldGreen rounded-xl text-xs py-2 px-3 text-primaryTxt font-bold"
                  />
                </div>

                {/* Date Selection */}
                <div className="space-y-1">
                  <label className="text-[10px] text-secondaryTxt font-bold uppercase tracking-wider">Transaction Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-whiteBg border border-borderCol focus:border-emeraldGreen focus:ring-1 focus:ring-emeraldGreen rounded-xl text-xs py-2 px-3 text-primaryTxt font-semibold"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-[10px] text-secondaryTxt font-bold uppercase tracking-wider">Expense Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-whiteBg border border-borderCol focus:border-emeraldGreen rounded-xl text-xs py-2 px-3 text-primaryTxt font-bold"
                >
                  <option value="Bought">Bought (Stocks purchased)</option>
                  <option value="Leftover">Leftover (Waste / Losses)</option>
                  <option value="Rent">Rent (Lease cost)</option>
                  <option value="Utilities">Utilities (Electricity, Water, WiFi)</option>
                  <option value="Salaries">Salaries (Staff wages)</option>
                  <option value="Other">Other Miscellaneous</option>
                </select>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-[10px] text-secondaryTxt font-bold uppercase tracking-wider">Optional Notes</label>
                <textarea
                  placeholder="Details, bill numbers, receipts, leftover descriptions..."
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-whiteBg border border-borderCol focus:border-emeraldGreen focus:ring-1 focus:ring-emeraldGreen rounded-xl text-xs py-2 px-3 text-primaryTxt"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitLoading}
                className="w-full py-2.5 bg-emeraldGreen hover:bg-emeraldGreenHover text-whiteBg font-black text-xs rounded-xl shadow-md shadow-emeraldGreen/10 flex items-center justify-center space-x-2 transition-colors mt-2"
              >
                {isSubmitLoading ? (
                  <div className="animate-spin border-2 border-whiteBg border-t-transparent w-4 h-4 rounded-full"></div>
                ) : (
                  <>
                    <FaPlus />
                    <span>SAVE EXPENSE RECORD</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Expenses List Table (Col-span depends on role) */}
        <div className={`bg-cardBg border border-borderCol rounded-3xl p-5 shadow-sm ${
          isAdmin ? 'lg:col-span-8' : 'lg:col-span-12'
        } space-y-4`}>
          <div>
            <h3 className="text-base font-extrabold text-primaryTxt flex items-center space-x-2">
              <FaFileInvoiceDollar className="text-emeraldGreen text-sm" />
              <span>Expense Log Sheet</span>
            </h3>
            <p className="text-xs text-secondaryTxt">Logged expenses and outlays for the month of {selectedMonth}</p>
          </div>

          <div className="overflow-x-auto w-full -mx-5 px-5 sm:mx-0 sm:px-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-3">
                <div className="animate-spin border-4 border-emeraldGreen border-t-transparent w-8 h-8 rounded-full"></div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-secondaryTxt">Loading logs...</span>
              </div>
            ) : expenses.length > 0 ? (
              <table className="w-full text-left border-collapse min-w-[650px] text-xs">
                <thead>
                  <tr className="border-b border-borderCol text-secondaryTxt font-semibold bg-lightgraySec/50">
                    <th className="py-3 px-3 w-12 text-center">S.No</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-4">Item details</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-4">Notes / Remarks</th>
                    <th className="py-3 px-3 text-right">Cost (₹)</th>
                    <th className="py-3 px-3 text-center">Added By</th>
                    {isAdmin && <th className="py-3 px-3 text-center">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderCol/60">
                  {expenses.map((item, idx) => (
                    <tr key={item._id} className="hover:bg-lightgraySec/30">
                      <td className="py-3.5 px-3 text-center text-secondaryTxt">{idx + 1}</td>
                      <td className="py-3.5 px-3 font-semibold">{item.date}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-primaryTxt text-xs">{item.itemName}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${getCategoryBadgeClass(item.category)}`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-secondaryTxt max-w-xs truncate">
                        {item.notes ? (
                          <span className="flex items-center space-x-1" title={item.notes}>
                            <FaRegStickyNote className="text-[9px] flex-shrink-0 text-mutedTxt" />
                            <span>{item.notes}</span>
                          </span>
                        ) : (
                          <span className="text-mutedTxt italic">None</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right font-black text-primaryTxt text-xs">
                        ₹{item.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-3 text-center text-secondaryTxt font-medium">
                        <span className="inline-flex items-center space-x-1 bg-lightgraySec px-2 py-0.5 rounded-md text-[10px]">
                          <FaUser className="text-[8px] text-mutedTxt" />
                          <span>{item.createdBy}</span>
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="py-3.5 px-3 text-center">
                          <button
                            onClick={() => handleDeleteExpense(item._id)}
                            className="p-1.5 bg-lightgraySec hover:bg-red-500 hover:text-whiteBg text-secondaryTxt rounded-lg transition-colors border border-borderCol/40"
                            title="Delete record"
                          >
                            <FaTrash className="text-[10px]" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-16 border border-dashed border-borderCol/80 rounded-2xl flex flex-col items-center justify-center space-y-2 text-center text-secondaryTxt">
                <FaInfoCircle className="text-mutedTxt text-2xl" />
                <span className="text-xs font-semibold">No expenses recorded for this month.</span>
                {isAdmin && <span className="text-[10px] text-mutedTxt">Use the form on the left to add items.</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
