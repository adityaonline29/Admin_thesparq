import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore, OrderStatus } from '../context/StoreContext';
import { Clock, CheckCircle, ChefHat, Truck, User, Phone, Mail, AlertCircle, ShoppingBag, XCircle, Timer, ArrowLeft, Calendar, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

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

export default function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, updateOrderStatus } = useStore();
  const [actionOrder, setActionOrder] = useState<{ id: string, type: 'accept' | 'reject' | 'update', status?: OrderStatus } | null>(null);
  const [estimatedTime, setEstimatedTime] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [confirmPayment, setConfirmPayment] = useState(false);

  const order = orders.find(o => o.id === id);

  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800">Order not found</h2>
        <button onClick={() => navigate('/dashboard/orders')} className="mt-4 text-blue-600 hover:underline">
          Back to Orders
        </button>
      </div>
    );
  }

  const StatusIcon = statusIcons[order.status];

  const handleStatusChange = (newStatus: OrderStatus) => {
    setConfirmPayment(false);
    if (newStatus === 'Accepted') {
      setActionOrder({ id: order.id, type: 'accept', status: newStatus });
      setEstimatedTime('30 mins');
    } else if (newStatus === 'Rejected') {
      setActionOrder({ id: order.id, type: 'reject', status: newStatus });
      setRejectionReason('');
    } else {
      // Check if payment is pending or COD
      if (order.paymentStatus === 'Pending' || (order.paymentStatus === 'Paid' && order.paymentMethod === 'COD')) {
         // Wait, if it's Paid and COD, it's already Paid? 
         // "for those order who's payment has not been received or cod"
         // If COD, payment is received upon delivery. So initially it might be Pending/COD.
         // If it is already Paid, we don't need to ask.
         // So condition: paymentStatus !== 'Paid' OR (paymentMethod === 'COD' && paymentStatus !== 'Paid')
         // Actually simpler: if paymentStatus !== 'Paid'
         setActionOrder({ id: order.id, type: 'update', status: newStatus });
      } else {
         updateOrderStatus(order.id, newStatus);
      }
    }
  };

  const confirmAction = () => {
    if (!actionOrder) return;

    const paymentUpdates = confirmPayment ? { paymentStatus: 'Paid' as const, paymentMethod: 'Cash' as const } : {};

    if (actionOrder.type === 'accept') {
      updateOrderStatus(actionOrder.id, 'Accepted', { estimatedTime, ...paymentUpdates });
    } else if (actionOrder.type === 'reject') {
      updateOrderStatus(actionOrder.id, 'Rejected', { rejectionReason, ...paymentUpdates });
    } else if (actionOrder.type === 'update' && actionOrder.status) {
      updateOrderStatus(actionOrder.id, actionOrder.status, paymentUpdates);
    }
    setActionOrder(null);
  };

  return (
    <div className="space-y-6">
      <button 
        onClick={() => navigate('/dashboard/orders')}
        className="flex items-center text-gray-600 hover:text-[#0a192f] transition-colors"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Orders
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-serif font-bold text-[#0a192f]">Order #{order.id.slice(-6)}</h1>
                <span className={clsx("px-3 py-1 rounded-full text-xs font-bold flex items-center", statusColors[order.status])}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {order.status}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date(order.createdAt).toLocaleString()}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-500">Update Status:</span>
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                className={clsx(
                  "px-4 py-2 rounded-lg font-medium text-sm border-none focus:ring-2 focus:ring-offset-2 transition-all cursor-pointer outline-none",
                  statusColors[order.status]
                )}
                disabled={order.status === 'Rejected' || order.status === 'Delivered'}
              >
                {Object.keys(statusColors).map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="p-6 grid md:grid-cols-3 gap-8">
          {/* Left Column: Details */}
          <div className="md:col-span-2 space-y-8">
            
            {/* Status Messages */}
            {order.estimatedTime && order.status !== 'Rejected' && (
              <div className="bg-blue-50 text-blue-800 px-4 py-3 rounded-lg flex items-center">
                <Timer className="h-5 w-5 mr-3" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider opacity-70">Estimated Time</p>
                  <p className="font-bold">{order.estimatedTime}</p>
                </div>
              </div>
            )}
            {order.rejectionReason && order.status === 'Rejected' && (
              <div className="bg-red-50 text-red-800 px-4 py-3 rounded-lg flex items-center">
                <XCircle className="h-5 w-5 mr-3" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider opacity-70">Rejection Reason</p>
                  <p className="font-bold">{order.rejectionReason}</p>
                </div>
              </div>
            )}

            {/* Order Items */}
            <div>
              <h3 className="text-lg font-bold text-[#0a192f] mb-4 flex items-center">
                <ShoppingBag className="h-5 w-5 mr-2 text-[#c5a059]" />
                Order Items
              </h3>
              <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                <table className="w-full text-left">
                  <thead className="bg-gray-100 text-gray-500 text-xs uppercase tracking-wider font-medium">
                    <tr>
                      <th className="px-6 py-3">Item</th>
                      <th className="px-6 py-3 text-center">Qty</th>
                      <th className="px-6 py-3 text-right">Price</th>
                      <th className="px-6 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {order.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-white transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="bg-[#0a192f] text-white text-xs font-bold px-2 py-1 rounded">
                            {item.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-gray-500">${item.price.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 font-bold text-[#0a192f]">
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-right">Total Amount</td>
                      <td className="px-6 py-4 text-right text-lg text-[#c5a059]">${order.totalAmount.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Customer Info & History */}
          <div className="space-y-6">
            {/* Payment Details */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Payment Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className={clsx(
                    "px-2 py-1 rounded text-xs font-bold",
                    order.paymentStatus === 'Paid' ? "bg-green-100 text-green-800" :
                    order.paymentStatus === 'Pending' ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
                  )}>
                    {order.paymentStatus}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Method</span>
                  <span className="font-medium text-gray-900">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
                  <span className="text-sm font-bold text-gray-900">Total Amount</span>
                  <span className="font-bold text-[#c5a059]">${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Customer Details
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Name</p>
                  <p className="font-medium text-gray-900">{order.customerName}</p>
                </div>
                {order.customerPhone && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Phone</p>
                    <div className="flex items-center font-medium text-gray-900">
                      <Phone className="h-3 w-3 mr-2 text-gray-400" />
                      {order.customerPhone}
                    </div>
                  </div>
                )}
                {order.customerEmail && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Email</p>
                    <div className="flex items-center font-medium text-gray-900 break-all">
                      <Mail className="h-3 w-3 mr-2 text-gray-400" />
                      {order.customerEmail}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order History Log */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Order History
              </h3>
              <div className="relative border-l-2 border-gray-100 ml-3 space-y-6">
                {order.history?.slice().reverse().map((log, idx) => (
                  <div key={idx} className="relative pl-6">
                    <div className={clsx(
                      "absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white",
                      statusColors[log.status].split(' ')[0] || 'bg-gray-200'
                    )} />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                      <span className={clsx("text-sm font-bold w-fit px-2 py-0.5 rounded mb-1", statusColors[log.status])}>
                        {log.status}
                      </span>
                      {log.note && (
                        <span className="text-sm text-gray-600 italic">
                          "{log.note}"
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Modal */}
      {actionOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className={clsx("px-6 py-4 flex justify-between items-center", 
              actionOrder.type === 'reject' ? "bg-red-600" : "bg-[#0a192f]"
            )}>
              <h2 className="text-white font-serif text-xl font-bold">
                {actionOrder.type === 'accept' ? 'Accept Order' : 
                 actionOrder.type === 'reject' ? 'Reject Order' : 
                 'Update Status'}
              </h2>
              <button onClick={() => setActionOrder(null)} className="text-white/70 hover:text-white">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {actionOrder.type === 'accept' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Preparation Time</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={estimatedTime}
                      onChange={(e) => setEstimatedTime(e.target.value)}
                      className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#c5a059] focus:border-transparent outline-none"
                      placeholder="e.g., 45 mins"
                      autoFocus
                    />
                    <Timer className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Let the customer know when to expect their food.</p>
                </div>
              )}
              
              {actionOrder.type === 'reject' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Rejection</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    rows={3}
                    placeholder="e.g., Item out of stock, Kitchen closing soon..."
                    autoFocus
                  />
                </div>
              )}

              {actionOrder.type === 'update' && (
                <div>
                  <p className="text-gray-700">
                    Are you sure you want to change the status to <span className="font-bold">{actionOrder.status}</span>?
                  </p>
                </div>
              )}

              {/* Payment Confirmation Checkbox */}
              {(order.paymentStatus === 'Pending' || order.paymentMethod === 'COD') && order.paymentStatus !== 'Paid' && (
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        checked={confirmPayment}
                        onChange={(e) => setConfirmPayment(e.target.checked)}
                        className="h-4 w-4 text-[#0a192f] border-gray-300 rounded focus:ring-[#c5a059]"
                      />
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">Confirm Payment Received</span>
                      <p className="text-gray-500 text-xs mt-0.5">Mark this order as Paid (Cash)</p>
                    </div>
                  </label>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => setActionOrder(null)}
                  className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  disabled={actionOrder.type === 'reject' && !rejectionReason.trim()}
                  className={clsx(
                    "px-4 py-2 rounded-lg text-white transition-colors shadow-md",
                    actionOrder.type === 'reject' 
                      ? "bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      : "bg-[#0a192f] hover:bg-[#152a45]"
                  )}
                >
                  {actionOrder.type === 'accept' ? 'Confirm Acceptance' : 
                   actionOrder.type === 'reject' ? 'Confirm Rejection' : 
                   'Update Status'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
