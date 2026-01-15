import React, { useState, useEffect } from "react";
import API from "../../../../api";
import Skeleton from "../../Common/Skeleton";


const Adminapproval = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [actionLoading, setActionLoading] = useState(null);

    // Fetch pending products on component mount
    useEffect(() => {
        fetchPendingProducts();
    }, []);

    const fetchPendingProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await API.get("/admin/products/pending");
            setProducts(response.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch pending products");
            console.error("Error fetching pending products:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (productId) => {
        try {
            setActionLoading(productId);
            await API.put(`/admin/products/approve/${productId}`);

            // Remove approved product from list
            setProducts(products.filter((p) => p._id !== productId));
            alert("Product approved successfully!");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to approve product");
            console.error("Error approving product:", err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectClick = (product) => {
        setSelectedProduct(product);
        setRejectionReason("");
    };

    const handleRejectSubmit = async () => {
        if (!rejectionReason.trim()) {
            alert("Please provide a rejection reason");
            return;
        }

        try {
            setActionLoading(selectedProduct._id);
            await API.put(`/admin/products/reject/${selectedProduct._id}`, {
                reason: rejectionReason
            });

            // Remove rejected product from list
            setProducts(products.filter((p) => p._id !== selectedProduct._id));
            setSelectedProduct(null);
            setRejectionReason("");
            alert("Product rejected successfully!");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to reject product");
            console.error("Error rejecting product:", err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleCloseModal = () => {
        setSelectedProduct(null);
        setRejectionReason("");
    };

    if (loading) {
        return (
            <div className="p-4 md:p-8 max-w-7xl mx-auto">
                <Skeleton className="h-10 w-64 mx-auto mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl overflow-hidden shadow-md space-y-4 pb-6">
                            <Skeleton className="w-full h-64" />
                            <div className="p-6 space-y-4">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-full" />
                                <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                                <div className="flex gap-4">
                                    <Skeleton className="h-12 w-full rounded-lg" />
                                    <Skeleton className="h-12 w-full rounded-lg" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }


    if (error) {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Product Approvals</h1>
                <div className="flex flex-col items-center justify-center py-16 gap-6">
                    <p className="text-red-600 text-lg text-center">{error}</p>
                    <button
                        onClick={fetchPendingProducts}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-600/30"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">Product Approvals</h1>

            {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <div className="text-6xl mb-4">📦</div>
                    <h2 className="text-2xl font-semibold text-gray-900">No Pending Products</h2>
                    <p className="text-gray-600">All products have been reviewed!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-8">
                    {products.map((product) => (
                        <div
                            key={product._id}
                            className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
                        >
                            {/* Product Images */}
                            <div className="relative w-full h-64 bg-gray-100 overflow-hidden">
                                {product.images && product.images.length > 0 ? (
                                    <img
                                        src={product.images[0]}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = '/Monkey.jpg';
                                            e.target.onerror = null;
                                        }}
                                    />
                                ) : (
                                    <img
                                        src="/Monkey.jpg"
                                        alt="No Image"
                                        className="w-full h-full object-cover"
                                    />
                                )}
                                {product.images && product.images.length > 1 && (
                                    <span className="absolute bottom-2.5 right-2.5 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                        +{product.images.length - 1}
                                    </span>
                                )}
                            </div>

                            {/* Product Details */}
                            <div className="p-6 flex-grow">
                                <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">{product.name}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed mb-5 line-clamp-3">{product.description}</p>

                                <div className="flex flex-col gap-3 mb-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 text-sm font-medium">Category:</span>
                                        <span className="text-gray-900 text-sm font-semibold">{product.category}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 text-sm font-medium">Price:</span>
                                        <span className="text-gray-900 text-sm font-semibold">₹{product.price?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 text-sm font-medium">Stock:</span>
                                        <span className="text-gray-900 text-sm font-semibold">{product.stock} units</span>
                                    </div>
                                    {product.sellerId && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 text-sm font-medium">Seller:</span>
                                            <span className="text-gray-900 text-sm font-semibold">
                                                {product.sellerId.businessName || product.sellerId.name || "N/A"}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <span className="text-gray-400 text-xs">
                                        Submitted: {new Date(product.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 p-6 border-t border-gray-200">
                                <button
                                    onClick={() => handleApprove(product._id)}
                                    disabled={actionLoading === product._id}
                                    className="flex-1 py-3.5 px-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-500/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                                >
                                    {actionLoading === product._id ? "Approving..." : "✓ Approve"}
                                </button>
                                <button
                                    onClick={() => handleRejectClick(product)}
                                    disabled={actionLoading === product._id}
                                    className="flex-1 py-3.5 px-6 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-500/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                                >
                                    {actionLoading === product._id ? "Rejecting..." : "✗ Reject"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Rejection Modal */}
            {selectedProduct && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={handleCloseModal}
                >
                    <div
                        className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl animate-[slideIn_0.3s_ease]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Reject Product</h2>
                        <p className="text-gray-600 mb-6">{selectedProduct.name}</p>

                        <label htmlFor="rejection-reason" className="block mb-2 font-semibold text-gray-700">
                            Rejection Reason:
                        </label>
                        <textarea
                            id="rejection-reason"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Please provide a reason for rejection..."
                            rows="5"
                            className="w-full px-3.5 py-3 border-2 border-gray-200 rounded-lg text-base resize-y focus:outline-none focus:border-indigo-600 transition-colors duration-300"
                        />

                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={handleCloseModal}
                                className="flex-1 py-3.5 px-6 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRejectSubmit}
                                disabled={!rejectionReason.trim() || actionLoading}
                                className="flex-1 py-3.5 px-6 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-500/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {actionLoading ? "Rejecting..." : "Submit Rejection"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Adminapproval;
