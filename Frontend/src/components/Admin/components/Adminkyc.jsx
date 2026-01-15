import React, { useState, useEffect } from 'react';
import API from '../../../../api';
import {
    MdVerifiedUser,
    MdCheckCircle,
    MdCancel,
    MdVisibility,
    MdSearch,
    MdFilterList
} from 'react-icons/md';

const Adminkyc = () => {
    const [kycRequests, setKycRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedKyc, setSelectedKyc] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchKycRequests();
    }, []);

    useEffect(() => {
        filterKycRequests();
    }, [searchTerm, filterStatus, kycRequests]);

    const fetchKycRequests = async () => {
        try {
            const response = await API.get('/admin/kyc/pending');

            // Map backend data to frontend format
            const mappedData = response.data.map(kyc => ({
                id: kyc._id,
                kycId: kyc._id,
                sellerName: kyc.sellerId?.name || 'N/A',
                businessName: kyc.sellerId?.businessName || 'N/A',
                email: kyc.sellerId?.email || 'N/A',
                phone: kyc.sellerId?.phone || 'N/A',
                gstNumber: kyc.business?.gstCertificate ? 'Available' : 'Not Available',
                panNumber: kyc.identity?.panCard ? 'Available' : 'Not Available',
                status: kyc.status === 'pending_review' ? 'pending' : kyc.status,
                submittedDate: new Date(kyc.createdAt).toLocaleDateString('en-IN'),
                documents: {
                    aadhaarFront: kyc.identity?.aadhaarFront,
                    aadhaarBack: kyc.identity?.aadhaarBack,
                    panCard: kyc.identity?.panCard,
                    tradeLicense: kyc.business?.tradeLicense,
                    gstCertificate: kyc.business?.gstCertificate,
                    explosiveLicense: kyc.explosiveLicense?.licenseImage,
                    fireNOC: kyc.fireNOC?.nocDocument,
                    cancelledCheque: kyc.bank?.chequeImage
                },
                explosiveLicense: kyc.explosiveLicense,
                fireNOC: kyc.fireNOC,
                bank: kyc.bank
            }));

            setKycRequests(mappedData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching KYC requests:', error);
            setLoading(false);
        }
    };

    const filterKycRequests = () => {
        let filtered = kycRequests;

        // Filter by status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(req => req.status === filterStatus);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(req =>
                req.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredRequests(filtered);
    };

    const handleApprove = async (kycId) => {
        try {
            await API.put(`/admin/kyc/review/${kycId}`, {
                status: 'approved'
            });

            // Update local state
            setKycRequests(prev =>
                prev.map(req =>
                    req.kycId === kycId
                        ? { ...req, status: 'approved', approvedDate: new Date().toLocaleDateString('en-IN') }
                        : req
                )
            );
            setSelectedKyc(null);
            alert('KYC approved successfully!');
        } catch (error) {
            console.error('Error approving KYC:', error);
            alert('Failed to approve KYC: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleReject = async (kycId) => {
        const reason = prompt('Please enter rejection reason:');
        if (!reason) return;

        try {
            await API.put(`/admin/kyc/review/${kycId}`, {
                status: 'rejected',
                rejectionReason: reason
            });

            // Update local state
            setKycRequests(prev =>
                prev.map(req =>
                    req.kycId === kycId
                        ? { ...req, status: 'rejected', rejectionReason: reason }
                        : req
                )
            );
            setSelectedKyc(null);
            alert('KYC rejected');
        } catch (error) {
            console.error('Error rejecting KYC:', error);
            alert('Failed to reject KYC: ' + (error.response?.data?.message || error.message));
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800'
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading KYC requests...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">KYC Verification</h1>
                <p className="text-gray-600">Review and approve seller KYC verification requests</p>
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
                                placeholder="Search by seller name, business, or email..."
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
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* KYC Requests Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Seller Details
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Business Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    GST Number
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Submitted Date
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
                            {filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        No KYC requests found
                                    </td>
                                </tr>
                            ) : (
                                filteredRequests.map((request) => (
                                    <tr key={request.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{request.sellerName}</div>
                                                <div className="text-sm text-gray-500">{request.email}</div>
                                                <div className="text-sm text-gray-500">{request.phone}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{request.businessName}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{request.gstNumber}</div>
                                            <div className="text-sm text-gray-500">PAN: {request.panNumber}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {request.submittedDate}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(request.status)}`}>
                                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setSelectedKyc(request)}
                                                    className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                                                >
                                                    <MdVisibility className="w-4 h-4" />
                                                    View
                                                </button>
                                                {request.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(request.kycId)}
                                                            className="text-green-600 hover:text-green-900 flex items-center gap-1"
                                                        >
                                                            <MdCheckCircle className="w-4 h-4" />
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(request.kycId)}
                                                            className="text-red-600 hover:text-red-900 flex items-center gap-1"
                                                        >
                                                            <MdCancel className="w-4 h-4" />
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* KYC Details Modal */}
            {selectedKyc && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">KYC Details</h2>
                                <button
                                    onClick={() => setSelectedKyc(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Seller Name</label>
                                        <p className="text-gray-900">{selectedKyc.sellerName}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Business Name</label>
                                        <p className="text-gray-900">{selectedKyc.businessName}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Email</label>
                                        <p className="text-gray-900">{selectedKyc.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Phone</label>
                                        <p className="text-gray-900">{selectedKyc.phone}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">GST Certificate</label>
                                        <p className="text-gray-900">{selectedKyc.gstNumber}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">PAN Card</label>
                                        <p className="text-gray-900">{selectedKyc.panNumber}</p>
                                    </div>
                                </div>

                                {/* Explosive License Details */}
                                {selectedKyc.explosiveLicense?.licenseNumber && (
                                    <div className="border-t pt-4">
                                        <h3 className="font-semibold text-gray-800 mb-3">Explosive License</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">License Type</label>
                                                <p className="text-gray-900">{selectedKyc.explosiveLicense.licenseType || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">License Number</label>
                                                <p className="text-gray-900">{selectedKyc.explosiveLicense.licenseNumber}</p>
                                            </div>
                                            {selectedKyc.explosiveLicense.expiryDate && (
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Expiry Date</label>
                                                    <p className="text-gray-900">{new Date(selectedKyc.explosiveLicense.expiryDate).toLocaleDateString('en-IN')}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Fire NOC Details */}
                                {selectedKyc.fireNOC?.expiryDate && (
                                    <div className="border-t pt-4">
                                        <h3 className="font-semibold text-gray-800 mb-3">Fire NOC</h3>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Expiry Date</label>
                                            <p className="text-gray-900">{new Date(selectedKyc.fireNOC.expiryDate).toLocaleDateString('en-IN')}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Bank Details */}
                                {selectedKyc.bank?.accountNumber && (
                                    <div className="border-t pt-4">
                                        <h3 className="font-semibold text-gray-800 mb-3">Bank Details</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Account Number</label>
                                                <p className="text-gray-900">{selectedKyc.bank.accountNumber}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">IFSC Code</label>
                                                <p className="text-gray-900">{selectedKyc.bank.ifsc || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="border-t pt-4">
                                    <h3 className="font-semibold text-gray-800 mb-3">Documents</h3>
                                    <div className="space-y-2">
                                        {selectedKyc.documents?.aadhaarFront && (
                                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                                <span className="text-sm text-gray-700">Aadhaar Card (Front)</span>
                                                <a href={selectedKyc.documents.aadhaarFront} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">View</a>
                                            </div>
                                        )}
                                        {selectedKyc.documents?.aadhaarBack && (
                                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                                <span className="text-sm text-gray-700">Aadhaar Card (Back)</span>
                                                <a href={selectedKyc.documents.aadhaarBack} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">View</a>
                                            </div>
                                        )}
                                        {selectedKyc.documents?.panCard && (
                                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                                <span className="text-sm text-gray-700">PAN Card</span>
                                                <a href={selectedKyc.documents.panCard} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">View</a>
                                            </div>
                                        )}
                                        {selectedKyc.documents?.gstCertificate && (
                                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                                <span className="text-sm text-gray-700">GST Certificate</span>
                                                <a href={selectedKyc.documents.gstCertificate} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">View</a>
                                            </div>
                                        )}
                                        {selectedKyc.documents?.tradeLicense && (
                                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                                <span className="text-sm text-gray-700">Trade License</span>
                                                <a href={selectedKyc.documents.tradeLicense} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">View</a>
                                            </div>
                                        )}
                                        {selectedKyc.documents?.explosiveLicense && (
                                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                                <span className="text-sm text-gray-700">Explosive License</span>
                                                <a href={selectedKyc.documents.explosiveLicense} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">View</a>
                                            </div>
                                        )}
                                        {selectedKyc.documents?.fireNOC && (
                                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                                <span className="text-sm text-gray-700">Fire NOC</span>
                                                <a href={selectedKyc.documents.fireNOC} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">View</a>
                                            </div>
                                        )}
                                        {selectedKyc.documents?.cancelledCheque && (
                                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                                <span className="text-sm text-gray-700">Cancelled Cheque</span>
                                                <a href={selectedKyc.documents.cancelledCheque} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">View</a>
                                            </div>
                                        )}
                                        {!selectedKyc.documents?.aadhaarFront && !selectedKyc.documents?.panCard && !selectedKyc.documents?.gstCertificate && (
                                            <p className="text-sm text-gray-500 text-center py-4">No documents available</p>
                                        )}
                                    </div>
                                </div>

                                {selectedKyc.status === 'pending' && (
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={() => handleApprove(selectedKyc.kycId)}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
                                        >
                                            <MdCheckCircle className="w-5 h-5" />
                                            Approve KYC
                                        </button>
                                        <button
                                            onClick={() => handleReject(selectedKyc.kycId)}
                                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
                                        >
                                            <MdCancel className="w-5 h-5" />
                                            Reject KYC
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Adminkyc;
