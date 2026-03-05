import React, { useState } from 'react';
import { useStore, OrderStatus } from '../context/StoreContext';
import { Clock, CheckCircle, ChefHat, Truck, AlertCircle, ShoppingBag, XCircle, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';

const statusColors: Record<OrderStatus, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Accepted: 'bg-blue-100 text-blue-800',
  Rejected: 'bg-red-100 text-red-800',
  Preparing: 'bg-purple-100 text-purple-800',
  Completed: 'bg-green-100 text-green-800',
  Delivered: 'bg-gray-100 text-gray-800',
};

const statusIcons: Record<OrderStatus, any> = {
  Pending: AlertCircle,
  Accepted: CheckCircle,
  Rejected: XCircle,
  Preparing: ChefHat,
  Completed: CheckCircle,
  Delivered: Truck,
};

export default function OrdersPage() {
  const { orders } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<OrderStatus | 'All'>('All');

  // Sort orders by date (newest first)
  const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filteredOrders = activeTab === 'All' 
    ? sortedOrders 
    : sortedOrders.filter(order => order.status === activeTab);

  const tabs: (OrderStatus | 'All')[] = ['All', 'Pending', 'Accepted', 'Preparing', 'Completed', 'Delivered', 'Rejected'];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-[#0a192f]">Order Management</h1>
        <p className="text-gray-500 mt-1">Track and manage customer orders in real-time</p>
      </div>

      {/* Status Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
              activeTab === tab
                ? "bg-[#0a192f] text-white"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            )}
          >
            {tab}
            {tab !== 'All' && (
              <span className={clsx(
                "ml-2 text-xs px-1.5 py-0.5 rounded-full",
                activeTab === tab ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"
              )}>
                {orders.filter(o => o.status === tab).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => {
                  const StatusIcon = statusIcons[order.status];
                  return (
                    <tr 
                      key={order.id} 
                      onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4 font-mono text-sm font-medium text-[#0a192f]">
                        #{order.id.slice(-6)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-2 text-gray-400" />
                          {new Date(order.createdAt).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {order.customerName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {order.items.length} items
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-[#c5a059]">
                        ${order.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex flex-col">
                          <span className={clsx(
                            "font-medium",
                            order.paymentStatus === 'Paid' ? "text-green-600" : 
                            order.paymentStatus === 'Pending' ? "text-yellow-600" : "text-red-600"
                          )}>
                            {order.paymentStatus}
                          </span>
                          <span className="text-xs text-gray-400">{order.paymentMethod}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={clsx(
                          "px-3 py-1 rounded-full text-xs font-bold flex items-center w-fit",
                          statusColors[order.status]
                        )}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          className="text-gray-400 hover:text-[#0a192f] transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/dashboard/orders/${order.id}`);
                          }}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No {activeTab === 'All' ? '' : activeTab.toLowerCase()} orders</h3>
            <p className="text-gray-500 mt-1">
              {activeTab === 'All' 
                ? "New orders will appear here automatically." 
                : `There are currently no orders in the '${activeTab}' status.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
