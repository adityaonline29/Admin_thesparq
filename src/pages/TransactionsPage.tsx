import React, { useState } from 'react';
import { useStore, PaymentStatus, PaymentMethod } from '../context/StoreContext';
import { Search, Filter, ArrowUpRight, ArrowDownLeft, CreditCard, Wallet, Banknote, Clock, CheckCircle, XCircle } from 'lucide-react';
import { clsx } from 'clsx';

export default function TransactionsPage() {
  const { orders } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'All'>('All');
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | 'All'>('All');
  const [dateFilter, setDateFilter] = useState<'All' | 'Today' | 'Week' | 'Month' | 'Custom'>('All');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Filter orders to get transactions
  // Assuming every order is a transaction for simplicity, or we could filter by those with payment attempts
  const transactions = orders.map(order => ({
    id: `txn-${order.id.split('-')[1]}`, // Mock transaction ID derived from order ID
    orderId: order.id,
    customerName: order.customerName,
    amount: order.totalAmount,
    status: order.paymentStatus,
    method: order.paymentMethod,
    date: order.createdAt,
  })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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

  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch = 
      txn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || txn.status === statusFilter;
    const matchesMethod = methodFilter === 'All' || txn.method === methodFilter;
    const matchesDate = isDateInFilter(txn.date);

    return matchesSearch && matchesStatus && matchesMethod && matchesDate;
  });

  const totalRevenue = filteredTransactions
    .filter(t => t.status === 'Paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingAmount = filteredTransactions
    .filter(t => t.status === 'Pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'Card': return <CreditCard className="h-4 w-4" />;
      case 'Online': return <Wallet className="h-4 w-4" />;
      case 'Cash': 
      case 'COD': return <Banknote className="h-4 w-4" />;
      default: return <Banknote className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case 'Paid': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'Failed': return <XCircle className="h-4 w-4 text-red-500" />;
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#0a192f]">Transactions</h1>
          <p className="text-gray-500 mt-1">Monitor payments and financial history</p>
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
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <h3 className="text-2xl font-bold text-[#0a192f] mt-1">${totalRevenue.toFixed(2)}</h3>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <ArrowUpRight className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Payments</p>
              <h3 className="text-2xl font-bold text-[#0a192f] mt-1">${pendingAmount.toFixed(2)}</h3>
            </div>
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Transactions</p>
              <h3 className="text-2xl font-bold text-[#0a192f] mt-1">{filteredTransactions.length}</h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <ArrowDownLeft className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Transaction ID, Order ID, or Customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#c5a059] focus:border-transparent outline-none text-sm"
          />
        </div>
        
        <div className="flex gap-3 w-full md:w-auto overflow-x-auto">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | 'All')}
              className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c5a059]"
            >
              <option value="All">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value as PaymentMethod | 'All')}
              className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c5a059]"
            >
              <option value="All">All Methods</option>
              <option value="Card">Card</option>
              <option value="Online">Online</option>
              <option value="Cash">Cash</option>
              <option value="COD">COD</option>
            </select>
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 font-mono text-sm font-medium text-gray-600">
                      {txn.id}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-[#0a192f]">
                      #{txn.orderId.slice(-6)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(txn.date).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {txn.customerName}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-[#c5a059]">
                      ${txn.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-2 text-gray-400">{getMethodIcon(txn.method)}</span>
                        {txn.method}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        "px-3 py-1 rounded-full text-xs font-bold flex items-center w-fit",
                        txn.status === 'Paid' ? "bg-green-100 text-green-800" :
                        txn.status === 'Pending' ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
                      )}>
                        <span className="mr-1.5">{getStatusIcon(txn.status)}</span>
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
