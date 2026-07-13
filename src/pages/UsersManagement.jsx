import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FaUserCheck, FaUserTimes, FaUsers, FaSearch, FaUserShield, FaClock } from 'react-icons/fa';

const UsersManagement = () => {
  const { usersList, approveUser, rejectUser, user } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  // Separate pending and active users
  const pendingUsers = usersList.filter(u => !u.approved);
  const activeUsers = usersList.filter(u => u.approved);

  const filteredActiveUsers = activeUsers.filter(u =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-primaryTxt">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-cardBg border border-borderCol rounded-3xl p-6 shadow-sm gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-primaryTxt md:text-2xl flex items-center gap-2.5">
            <FaUsers className="text-emeraldGreen" />
            <span>Staff & Approvals Control</span>
          </h2>
          <p className="text-xs text-secondaryTxt">
            Approve new registration requests and oversee active POS users.
          </p>
        </div>
      </div>

      {/* Grid: Pending Approvals (Left/Full) and Active Staff (Right/Full) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Pending Approvals requests */}
        <div className="lg:col-span-5 bg-cardBg border border-borderCol rounded-3xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-primaryTxt flex items-center gap-2">
              <FaClock className="text-amber-500 text-sm" />
              <span>Pending Requests</span>
            </h3>
            <p className="text-[11px] text-secondaryTxt">Users awaiting approval to login</p>
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {pendingUsers.length > 0 ? (
              pendingUsers.map((pUser) => (
                <div
                  key={pUser._id}
                  className="p-4 rounded-2xl border border-amber-200 bg-amber-50/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn"
                >
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-primaryTxt lowercase">
                      {pUser.username}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-100/70 text-amber-800 uppercase tracking-wide">
                      {pUser.role}
                    </span>
                    <p className="text-[9px] text-mutedTxt">
                      Requested: {new Date(pUser.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => approveUser(pUser._id)}
                      className="px-3 py-1.5 bg-emeraldGreen hover:bg-emeraldGreenHover text-whiteBg text-[10px] font-black rounded-xl shadow-md shadow-emeraldGreen/10 flex items-center gap-1 transition-all"
                    >
                      <FaUserCheck />
                      <span>APPROVE</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Deny registration request from "${pUser.username}"?`)) {
                          rejectUser(pUser._id);
                        }
                      }}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-[10px] font-black rounded-xl flex items-center gap-1 transition-all"
                    >
                      <FaUserTimes />
                      <span>DENY</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 border border-dashed border-borderCol rounded-2xl text-center text-secondaryTxt text-xs bg-lightgraySec/20">
                No pending registration requests.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Staff Directory */}
        <div className="lg:col-span-7 bg-cardBg border border-borderCol rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-primaryTxt flex items-center gap-2">
                <FaUserShield className="text-emeraldGreen text-sm" />
                <span>Authorized Directory</span>
              </h3>
              <p className="text-[11px] text-secondaryTxt">Active accounts with POS access privileges</p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-48">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-mutedTxt">
                <FaSearch className="text-[10px]" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staff..."
                className="w-full pl-8 pr-3 py-1.5 text-[10px] bg-whiteBg border border-borderCol focus:border-emeraldGreen focus:ring-1 focus:ring-emeraldGreen rounded-xl text-primaryTxt"
              />
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-borderCol text-secondaryTxt font-semibold bg-lightgraySec/50">
                  <th className="py-2.5 px-3">Username</th>
                  <th className="py-2.5 px-3">System Role</th>
                  <th className="py-2.5 px-3">Date Approved</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderCol/60">
                {filteredActiveUsers.length > 0 ? (
                  filteredActiveUsers.map((aUser) => {
                    const isSelf = aUser.username.toLowerCase() === user?.username.toLowerCase();
                    return (
                      <tr key={aUser._id} className="hover:bg-lightgraySec/30">
                        <td className="py-3 px-3 font-semibold text-primaryTxt lowercase">
                          {aUser.username} {isSelf && <span className="text-[9px] text-emeraldGreen font-bold italic">(You)</span>}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide ${
                            aUser.role === 'admin'
                              ? 'bg-purple-105/90 text-purple-700 border border-purple-200'
                              : 'bg-emerald-100/70 text-emerald-800 border border-emerald-200'
                          }`}>
                            {aUser.role}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-secondaryTxt">
                          {new Date(aUser.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            disabled={isSelf}
                            onClick={() => {
                              if (window.confirm(`Revoke approvals and delete access for staff "${aUser.username}"?`)) {
                                rejectUser(aUser._id);
                              }
                            }}
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-colors ${
                              isSelf
                                ? 'bg-lightgraySec text-mutedTxt border-borderCol cursor-not-allowed'
                                : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                            }`}
                          >
                            Revoke Access
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-mutedTxt text-xs italic">
                      No active users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UsersManagement;
