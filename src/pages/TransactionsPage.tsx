import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Search, Filter, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, X, FileText, Calendar, DollarSign, Receipt, Percent, User } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function TransactionsPage() {
  const { orders } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [payoutTab, setPayoutTab] = useState<'Pending' | 'Completed'>('Pending');
  const [dateFilter, setDateFilter] = useState<'All' | 'Today' | 'Week' | 'Month' | 'Custom'>('All');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Filter orders to get payouts (only paid orders)
  const payouts = orders
    .filter(order => order.paymentStatus === 'Paid')
    .map(order => {
      const commissionRate = 0.10; // 10% commission
      const commission = order.totalAmount * commissionRate;
      const netPayout = order.totalAmount - commission;
      const isCompleted = order.payoutStatus === 'Completed';
      return {
        id: isCompleted ? `pay-${order.id.split('-')[1]}` : null,
        orderId: order.id,
        customerName: order.customerName,
        totalAmount: order.totalAmount,
        commission,
        netPayout,
        status: order.payoutStatus || 'Pending',
        orderDate: order.createdAt,
        settlementDate: isCompleted ? order.createdAt : null, // Mock settlement date
      };
    })
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

  const isDateInFilter = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (dateFilter) {
      case 'Today':
        return date >= today && date < new Date(today.getTime() + 86400000);
      case 'Week': {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
        return date >= startOfWeek;
      }
      case 'Month':
        return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
      case 'Custom': {
        if (!customStartDate) return true;
        const start = new Date(customStartDate);
        const end = customEndDate ? new Date(customEndDate) : new Date(customStartDate);
        end.setHours(23, 59, 59, 999); // End of the day
        return date >= start && date <= end;
      }
      default:
        return true;
    }
  };

  const filteredPayouts = payouts.filter(payout => {
    const matchesSearch = 
      (payout.id && payout.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      payout.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = payout.status === payoutTab;
    const matchesDate = isDateInFilter(payout.orderDate);

    return matchesSearch && matchesTab && matchesDate;
  });

  const totalCompletedPayouts = payouts
    .filter(p => p.status === 'Completed')
    .reduce((sum, p) => sum + p.netPayout, 0);

  const totalPendingPayouts = payouts
    .filter(p => p.status === 'Pending')
    .reduce((sum, p) => sum + p.netPayout, 0);

  const totalCommissionPaid = payouts
    .filter(p => p.status === 'Completed')
    .reduce((sum, p) => sum + p.commission, 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getDateRangeLabel = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (dateFilter) {
      case 'Today':
        return today.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      case 'Week': {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`;
      }
      case 'Month':
        return now.toLocaleString('default', { month: 'long', year: 'numeric' });
      case 'Custom':
        if (customStartDate && customEndDate) {
           return `${new Date(customStartDate).toLocaleDateString()} - ${new Date(customEndDate).toLocaleDateString()}`;
        }
        return 'Custom Range';
      default:
        return 'All Time';
    }
  };

  const selectedOrder = orders.find(o => o.id === selectedOrderId);
  const selectedPayout = payouts.find(p => p.orderId === selectedOrderId);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#0a192f]">Payouts</h1>
          <p className="text-gray-500 mt-1">Manage settlements from superadmin</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-3 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
            <div className="relative">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="appearance-none bg-transparent text-gray-700 py-2 pl-4 pr-10 rounded-lg text-sm font-medium focus:outline-none cursor-pointer"
              >
                <option value="All">All Time</option>
                <option value="Today">Today</option>
                <option value="Week">This Week</option>
                <option value="Month">This Month</option>
                <option value="Custom">Custom Range</option>
              </select>
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {dateFilter === 'Custom' && (
              <div className="flex items-center gap-2 px-2 border-l border-gray-200">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="bg-gray-50 border border-gray-200 text-gray-700 py-1 px-2 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#c5a059]"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  min={customStartDate}
                  className="bg-gray-50 border border-gray-200 text-gray-700 py-1 px-2 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#c5a059]"
                />
              </div>
            )}
          </div>
          <p className="text-sm font-medium text-[#c5a059]">{getDateRangeLabel()}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Settled</p>
              <h3 className="text-2xl font-bold text-[#0a192f] mt-1">${totalCompletedPayouts.toFixed(2)}</h3>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <ArrowUpRight className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Settlement</p>
              <h3 className="text-2xl font-bold text-[#0a192f] mt-1">${totalPendingPayouts.toFixed(2)}</h3>
            </div>
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Commission Paid</p>
              <h3 className="text-2xl font-bold text-[#0a192f] mt-1">${totalCommissionPaid.toFixed(2)}</h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Percent className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100/50 p-1 rounded-xl w-fit border border-gray-200">
        <button
          onClick={() => setPayoutTab('Pending')}
          className={clsx(
            "px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            payoutTab === 'Pending'
              ? "bg-white text-[#0a192f] shadow-sm ring-1 ring-gray-200/50"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
          )}
        >
          Pending Payouts
        </button>
        <button
          onClick={() => setPayoutTab('Completed')}
          className={clsx(
            "px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            payoutTab === 'Completed'
              ? "bg-white text-[#0a192f] shadow-sm ring-1 ring-gray-200/50"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
          )}
        >
          Completed Payouts
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Payout ID or Order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#c5a059] focus:border-transparent outline-none text-sm"
          />
        </div>
      </div>

      {/* Payouts Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-medium border-b border-gray-100">
              <tr>
                {payoutTab === 'Completed' && <th className="px-6 py-4">Payout ID</th>}
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Order Date</th>
                {payoutTab === 'Completed' && <th className="px-6 py-4">Settlement Date</th>}
                <th className="px-6 py-4">Order Total</th>
                <th className="px-6 py-4">Commission (10%)</th>
                <th className="px-6 py-4">Net Payout</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPayouts.length > 0 ? (
                filteredPayouts.map((payout) => (
                  <tr 
                    key={payout.orderId} 
                    className="hover:bg-gray-50 transition-colors group cursor-pointer"
                    onClick={() => setSelectedOrderId(payout.orderId)}
                  >
                    {payoutTab === 'Completed' && (
                      <td className="px-6 py-4 font-mono text-sm font-medium text-gray-600">
                        {payout.id}
                      </td>
                    )}
                    <td className="px-6 py-4 font-mono text-sm text-[#0a192f]">
                      #{payout.orderId.slice(-6)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(payout.orderDate).toLocaleString()}
                    </td>
                    {payoutTab === 'Completed' && (
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(payout.settlementDate!).toLocaleString()}
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      ${payout.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-red-500">
                      -${payout.commission.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-[#c5a059]">
                      ${payout.netPayout.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        "px-3 py-1 rounded-full text-xs font-bold flex items-center w-fit",
                        payout.status === 'Completed' ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      )}>
                        <span className="mr-1.5">{getStatusIcon(payout.status)}</span>
                        {payout.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No payouts found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      <AnimatePresence>
        {selectedOrder && selectedPayout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="bg-[#0a192f] px-6 py-4 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Receipt className="h-5 w-5 text-[#c5a059]" />
                  </div>
                  <div>
                    <h2 className="text-white font-serif text-xl font-bold">
                      Payout Details
                    </h2>
                    <p className="text-white/70 text-sm mt-0.5 font-mono">
                      {selectedPayout.id ? selectedPayout.id : `Order #${selectedPayout.orderId.slice(-6)}`}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedOrderId(null)}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Customer Details */}
                  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                      <User className="h-4 w-4 text-[#c5a059]" />
                      Customer Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Name</p>
                        <p className="text-sm font-medium text-gray-900 mt-0.5">{selectedOrder.customerName}</p>
                      </div>
                      {selectedOrder.customerEmail && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Email</p>
                          <p className="text-sm text-gray-700 mt-0.5">{selectedOrder.customerEmail}</p>
                        </div>
                      )}
                      {selectedOrder.customerPhone && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Phone</p>
                          <p className="text-sm text-gray-700 mt-0.5">{selectedOrder.customerPhone}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payout Details */}
                  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                      <DollarSign className="h-4 w-4 text-[#c5a059]" />
                      Payout Breakdown
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Order Total</p>
                        <p className="text-sm font-medium text-gray-900">${selectedPayout.totalAmount.toFixed(2)}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Commission (10%)</p>
                        <p className="text-sm font-medium text-red-500">-${selectedPayout.commission.toFixed(2)}</p>
                      </div>
                      <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Net Payout</p>
                        <p className="text-lg font-bold text-[#c5a059]">${selectedPayout.netPayout.toFixed(2)}</p>
                      </div>
                      <div className="pt-2 flex justify-between items-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Status</p>
                        <span className={clsx(
                          "px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center",
                          selectedPayout.status === 'Completed' ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        )}>
                          <span className="mr-1.5">{getStatusIcon(selectedPayout.status)}</span>
                          {selectedPayout.status}
                        </span>
                      </div>
                      <div className="pt-2 flex justify-between items-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Order Date</p>
                        <p className="text-sm text-gray-700 flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          {new Date(selectedPayout.orderDate).toLocaleString()}
                        </p>
                      </div>
                      {selectedPayout.status === 'Completed' && (
                        <div className="pt-2 flex justify-between items-center">
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Settlement Date</p>
                          <p className="text-sm text-gray-700 flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            {new Date(selectedPayout.settlementDate!).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm md:col-span-2 space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-[#c5a059]" />
                        Order Summary
                      </h3>
                      <span className="text-xs font-mono text-gray-500">Order #{selectedOrder.id.slice(-6)}</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="max-h-48 overflow-y-auto pr-2 space-y-2">
                        {selectedOrder.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm py-1 border-b border-gray-50 last:border-0">
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-gray-900">{item.quantity}x</span>
                              <span className="text-gray-700">{item.name}</span>
                            </div>
                            <span className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                        <span className="font-bold text-gray-900">Total Amount</span>
                        <span className="text-xl font-bold text-[#c5a059]">${selectedOrder.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
