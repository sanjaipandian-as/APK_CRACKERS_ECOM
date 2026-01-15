import React, { useState, useEffect } from 'react';
import API from '../../../../api';
import {
    MdShoppingCart,
    MdSearch,
    MdFilterList,
    MdVisibility,
    MdLocalShipping,
    MdCheckCircle,
    MdCancel,
    MdPending,
    MdHourglassEmpty
} from 'react-icons/md';
import { formatAddress } from '../../../utils/addressHelper';
import Skeleton from '../../Common/Skeleton';


const Adminorders = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        filterOrders();
    }, [searchTerm, filterStatus, orders]);

    const fetchOrders = async () => {
        try {
            const response = await API.get('/admin/orders');

            // Map backend data to frontend format
            const mappedData = response.data.map(order => ({
                id: order._id,
                orderId: order._id,
                customerName: order.customerId?.name || 'N/A',
                customerEmail: order.customerId?.email || 'N/A',
                customerPhone: order.customerId?.phone || 'N/A',
                sellerName: order.sellerId?.name || 'N/A',
                sellerBusinessName: order.sellerId?.businessName || 'N/A',
                products: order.items?.map(item => ({
                    name: item.productId?.name || 'Unknown Product',
                    quantity: item.quantity,
                    price: item.price || item.productId?.pricing?.selling_price || 0
                })) || [],
                totalAmount: order.totalAmount || order.items?.reduce((sum, item) => sum + ((item.price || item.productId?.pricing?.selling_price || 0) * item.quantity), 0) || 0,
                status: order.status,
                paymentStatus: order.paymentStatus,
                orderDate: new Date(order.createdAt).toLocaleDateString('en-IN'),
                shippingAddress: formatAddress(order.shippingAddress),
                updatedAt: new Date(order.updatedAt).toLocaleDateString('en-IN')
            }));

            setOrders(mappedData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setLoading(false);
        }
    };

    const filterOrders = () => {
        let filtered = orders;

        // Filter by status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(order => order.status === filterStatus);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(order =>
                order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredOrders(filtered);
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await API.put(`/admin/orders/update/${orderId}`, {
                status: newStatus
            });

            // Update local state
            setOrders(prev =>
                prev.map(order =>
                    order.orderId === orderId
                        ? { ...order, status: newStatus }
                        : order
                )
            );
            setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
            alert(`Order status updated to ${newStatus}`);
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Failed to update order status: ' + (error.response?.data?.message || error.message));
        }
    };

    const getStatusInfo = (status) => {
        const statusMap = {
            pending_payment: {
                bg: 'bg-yellow-100',
                text: 'text-yellow-800',
                icon: MdPending,
                label: 'Pending Payment'
            },
            paid: {
                bg: 'bg-blue-100',
                text: 'text-blue-800',
                icon: MdCheckCircle,
                label: 'Paid'
            },
            packed: {
                bg: 'bg-purple-100',
                text: 'text-purple-800',
                icon: MdHourglassEmpty,
                label: 'Packed'
            },
            shipped: {
                bg: 'bg-indigo-100',
                text: 'text-indigo-800',
                icon: MdLocalShipping,
                label: 'Shipped'
            },
            delivered: {
                bg: 'bg-green-100',
                text: 'text-green-800',
                icon: MdCheckCircle,
                label: 'Delivered'
            },
            cancelled: {
                bg: 'bg-red-100',
                text: 'text-red-800',
                icon: MdCancel,
                label: 'Cancelled'
            }
        };
        return statusMap[status] || statusMap.pending_payment;
    };

    if (loading) {
        return (
            <div className="h-full">
                <div className="mb-6">
                    <Skeleton className="h-10 w-64 mb-2" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-12" />
                                    <Skeleton className="h-8 w-16" />
                                </div>
                                <Skeleton variant="circle" className="w-8 h-8" />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    {[...Array(7)].map((_, i) => (
                                        <th key={i} className="px-6 py-3"><Skeleton className="h-4 w-20" /></th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {[...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                                        <td className="px-6 py-4"><div className="space-y-2"><Skeleton className="h-4 w-32" /> <Skeleton className="h-3 w-24" /></div></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-6 w-24 rounded-full" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div className="h-full">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Orders Management</h1>
                <p className="text-gray-600">View and manage all customer orders</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total</p>
                            <p className="text-2xl font-bold text-gray-800">{orders.length}</p>
                        </div>
                        <MdShoppingCart className="w-8 h-8 text-gray-400" />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Pending Payment</p>
                            <p className="text-2xl font-bold text-yellow-600">
                                {orders.filter(o => o.status === 'pending_payment').length}
                            </p>
                        </div>
                        <MdPending className="w-8 h-8 text-yellow-400" />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Paid</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {orders.filter(o => o.status === 'paid').length}
                            </p>
                        </div>
                        <MdCheckCircle className="w-8 h-8 text-blue-400" />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Packed</p>
                            <p className="text-2xl font-bold text-purple-600">
                                {orders.filter(o => o.status === 'packed').length}
                            </p>
                        </div>
                        <MdHourglassEmpty className="w-8 h-8 text-purple-400" />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Delivered</p>
                            <p className="text-2xl font-bold text-green-600">
                                {orders.filter(o => o.status === 'delivered').length}
                            </p>
                        </div>
                        <MdCheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by order ID, customer name, or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <MdFilterList className="text-gray-400 w-5 h-5" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Status</option>
                            <option value="pending_payment">Pending Payment</option>
                            <option value="paid">Paid</option>
                            <option value="packed">Packed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Order ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Products
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Order Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                        No orders found
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => {
                                    const statusInfo = getStatusInfo(order.status);
                                    const StatusIcon = statusInfo.icon;

                                    return (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-blue-600">{order.id}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                                                    <div className="text-sm text-gray-500">{order.customerEmail}</div>
                                                    <div className="text-sm text-gray-500">{order.customerPhone}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    {order.products.length} item{order.products.length > 1 ? 's' : ''}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-gray-900">₹{order.totalAmount}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {order.orderDate}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {statusInfo.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                                                >
                                                    <MdVisibility className="w-4 h-4" />
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
                                    <p className="text-blue-600 font-medium">{selectedOrder.id}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="text-gray-400 hover:text-gray-600 text-2xl"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Customer Info */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-800 mb-3">Customer Information</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Name</label>
                                            <p className="text-gray-900">{selectedOrder.customerName}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Email</label>
                                            <p className="text-gray-900">{selectedOrder.customerEmail}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-sm font-medium text-gray-500">Phone</label>
                                            <p className="text-gray-900">{selectedOrder.customerPhone}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-sm font-medium text-gray-500">Shipping Address</label>
                                            <p className="text-gray-900">{selectedOrder.shippingAddress}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Seller Info */}
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-800 mb-3">Seller Information</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Seller Name</label>
                                            <p className="text-gray-900">{selectedOrder.sellerName}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Business Name</label>
                                            <p className="text-gray-900">{selectedOrder.sellerBusinessName}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Products */}
                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-3">Order Items</h3>
                                    <div className="space-y-2">
                                        {selectedOrder.products.map((product, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                                    <p className="text-xs text-gray-500">Quantity: {product.quantity}</p>
                                                </div>
                                                <p className="text-sm font-semibold text-gray-900">₹{product.price * product.quantity}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                                        <span className="font-semibold text-gray-800">Total Amount</span>
                                        <span className="text-xl font-bold text-gray-900">₹{selectedOrder.totalAmount}</span>
                                    </div>
                                </div>

                                {/* Order Status */}
                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-3">Order Status</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600">Current Status:</span>
                                            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusInfo(selectedOrder.status).bg} ${getStatusInfo(selectedOrder.status).text}`}>
                                                {getStatusInfo(selectedOrder.status).label}
                                            </span>
                                        </div>

                                        {selectedOrder.trackingNumber && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Tracking Number</label>
                                                <p className="text-gray-900 font-mono">{selectedOrder.trackingNumber}</p>
                                            </div>
                                        )}

                                        {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                                            <div className="pt-3">
                                                <label className="text-sm font-medium text-gray-700 block mb-2">Update Status:</label>
                                                <div className="flex gap-2 flex-wrap">
                                                    {selectedOrder.status === 'pending_payment' && (
                                                        <button
                                                            onClick={() => handleUpdateStatus(selectedOrder.orderId, 'paid')}
                                                            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium"
                                                        >
                                                            Mark as Paid
                                                        </button>
                                                    )}
                                                    {selectedOrder.status === 'paid' && (
                                                        <button
                                                            onClick={() => handleUpdateStatus(selectedOrder.orderId, 'packed')}
                                                            className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm font-medium"
                                                        >
                                                            Mark as Packed
                                                        </button>
                                                    )}
                                                    {selectedOrder.status === 'packed' && (
                                                        <button
                                                            onClick={() => handleUpdateStatus(selectedOrder.orderId, 'shipped')}
                                                            className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg text-sm font-medium"
                                                        >
                                                            Mark as Shipped
                                                        </button>
                                                    )}
                                                    {selectedOrder.status === 'shipped' && (
                                                        <button
                                                            onClick={() => handleUpdateStatus(selectedOrder.orderId, 'delivered')}
                                                            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium"
                                                        >
                                                            Mark as Delivered
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {selectedOrder.cancellationReason && (
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                                <label className="text-sm font-medium text-red-800">Cancellation Reason</label>
                                                <p className="text-red-700 text-sm">{selectedOrder.cancellationReason}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Adminorders;
