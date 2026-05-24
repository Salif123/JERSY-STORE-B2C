'use client';

import React, { useState } from 'react';
import { Order, CartItem } from '@/types';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { format } from 'date-fns';
import { Search, Eye, Calendar, User, Phone, Mail, MapPin } from 'lucide-react';

interface OrderTableProps {
  initialOrders: Order[];
}

export const OrderTable: React.FC<OrderTableProps> = ({ initialOrders }) => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.razorpay_order_id &&
        order.razorpay_order_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ? true : order.payment_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Order['payment_status']) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">Paid</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'failed':
        return <Badge variant="danger">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search by customer name, email, or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-850 text-slate-100 rounded-lg placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm font-medium"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-900 border border-slate-855 text-slate-200 rounded-lg px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="all">All Statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-850 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-350">
            <thead className="bg-slate-950/60 border-b border-slate-850 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Date</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/60 font-semibold">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-850/20 transition-colors">
                    <td className="p-4">
                      <div className="font-mono text-xs text-indigo-400">
                        {order.razorpay_order_id || `${order.id.slice(0, 8)}...`}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-200">{order.customer_name}</div>
                      <div className="text-xs text-slate-500 font-medium">{order.customer_email}</div>
                    </td>
                    <td className="p-4 text-xs">
                      {format(new Date(order.created_at), 'dd MMM yyyy, hh:mm a')}
                    </td>
                    <td className="p-4 text-slate-200 font-bold">
                      ₹{order.total.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4">{getStatusBadge(order.payment_status)}</td>
                    <td className="p-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                        className="h-8 px-2.5 hover:bg-slate-800 text-indigo-400"
                      >
                        <Eye className="h-4 w-4 mr-1.5" />
                        Details
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title="Order Invoice Details"
        footer={
          <Button variant="secondary" onClick={() => setSelectedOrder(null)}>
            Close
          </Button>
        }
      >
        {selectedOrder && (
          <div className="space-y-5">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Internal Invoice ID
                </span>
                <p className="font-mono text-xs text-indigo-400 font-bold">{selectedOrder.id}</p>
              </div>
              <div className="text-right sm:text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Payment Status
                </span>
                <div className="mt-0.5">{getStatusBadge(selectedOrder.payment_status)}</div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="space-y-2 bg-slate-950 p-4 border border-slate-850 rounded-lg">
              <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wide mb-2">
                Customer Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-slate-500" />
                  <span className="text-slate-300 font-bold">{selectedOrder.customer_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-500" />
                  <span className="text-slate-400">{selectedOrder.customer_phone}</span>
                </div>
                <div className="flex items-center gap-2 sm:col-span-2">
                  <Mail className="h-3.5 w-3.5 text-slate-500" />
                  <span className="text-slate-400">{selectedOrder.customer_email}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="space-y-2 bg-slate-950 p-4 border border-slate-850 rounded-lg">
              <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wide mb-2 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                Shipping Address
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                {selectedOrder.shipping_address.street},<br />
                {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} -{' '}
                {selectedOrder.shipping_address.zip}
              </p>
            </div>

            {/* Items Summary */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wide">
                Items Ordered
              </h4>
              <div className="divide-y divide-slate-800 border border-slate-800 rounded-lg overflow-hidden">
                {(selectedOrder.items as CartItem[]).map((item, idx) => {
                  const name = item.name || item.product?.name || 'Jersey';
                  const price = item.price || item.product?.price || 0;
                  return (
                    <div key={idx} className="p-3 bg-slate-950/40 flex items-center justify-between text-xs font-semibold">
                      <div>
                        <p className="text-slate-200 font-bold">{name}</p>
                        <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                          Size: {item.size} | Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="text-slate-300 font-bold">
                        ₹{(price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Price Calculations */}
            <div className="border-t border-slate-800 pt-4 space-y-2 text-xs font-bold">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span>₹{selectedOrder.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-rose-400">
                  <span>Discount</span>
                  <span>-₹{selectedOrder.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-100 text-sm font-extrabold pt-2 border-t border-slate-800/60">
                <span>Grand Total</span>
                <span className="text-indigo-400">₹{selectedOrder.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
