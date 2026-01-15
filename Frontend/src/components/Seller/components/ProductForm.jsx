import React, { useState } from 'react';
import { MdUploadFile, MdClose, MdCheckCircle, MdImage } from 'react-icons/md';
import API from '../../../../api';

const ProductForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        brand: '',
        net_quantity: '',
        selling_price: '',
        mrp: '',
        gst_percentage: '18',
        category_main: '',
        category_sub: '',
        stock_boxes: '',
        pieces_per_box: '1',
        min_order_qty: '1'
    });

    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const categoryOptions = [
        'Sparklers',
        'Ground Spinners',
        'Aerial Fireworks',
        'Rockets',
        'Fountains',
        'Crackers',
        'Novelties',
        'Gift Boxes',
        'Others'
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) setError('');
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);

        // Limit to 5 images
        if (images.length + files.length > 5) {
            setError('You can upload maximum 5 images');
            return;
        }

        // Validate file size (5MB max per file)
        const invalidFiles = files.filter(file => file.size > 5 * 1024 * 1024);
        if (invalidFiles.length > 0) {
            setError('Each image must be less than 5MB');
            return;
        }

        setImages(prev => [...prev, ...files]);

        // Create previews
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (images.length === 0) {
            setError('Please upload at least one product image');
            return;
        }

        if (!formData.name || !formData.selling_price || !formData.category_main || !formData.net_quantity) {
            setError('Name, Price, Category, and Net Quantity are required');
            return;
        }

        if (parseFloat(formData.selling_price) <= 0) {
            setError('Selling price must be greater than 0');
            return;
        }

        if (parseInt(formData.stock_boxes) < 0) {
            setError('Stock boxes cannot be negative');
            return;
        }

        setLoading(true);

        try {
            // Create FormData for multipart/form-data
            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('description', formData.description);
            submitData.append('brand', formData.brand);
            submitData.append('net_quantity', formData.net_quantity);
            submitData.append('selling_price', formData.selling_price);
            submitData.append('mrp', formData.mrp);
            submitData.append('gst_percentage', formData.gst_percentage);
            submitData.append('category_main', formData.category_main);
            submitData.append('category_sub', formData.category_sub);
            submitData.append('stock_boxes', formData.stock_boxes);
            submitData.append('pieces_per_box', formData.pieces_per_box);
            submitData.append('min_order_qty', formData.min_order_qty);

            // Append all images
            images.forEach((image) => {
                submitData.append('images', image);
            });

            const response = await API.post('/products/add', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setSuccess('Product submitted successfully! It will be available after admin approval.');

            // Reset form
            setFormData({
                name: '',
                description: '',
                brand: '',
                net_quantity: '',
                selling_price: '',
                mrp: '',
                gst_percentage: '18',
                category_main: '',
                category_sub: '',
                stock_boxes: '',
                pieces_per_box: '1',
                min_order_qty: '1'
            });
            setImages([]);
            setImagePreviews([]);

        } catch (err) {
            console.error('Product submission error:', err);
            setError(err.response?.data?.message || 'Failed to submit product. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            category: '',
            stock: ''
        });
        setImages([]);
        setImagePreviews([]);
        setError('');
        setSuccess('');
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
                <p className="text-sm text-gray-500 mt-1">Fill in the details to add a new product to your store</p>
            </div>

            {/* Success/Error Messages */}
            {success && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                    <p className="text-sm font-medium">{success}</p>
                </div>
            )}

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Product Images */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Product Images</h2>

                            {/* Image Upload */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Upload Images (Max 5) <span className="text-red-500">*</span>
                                </label>

                                {imagePreviews.length < 5 && (
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors cursor-pointer mb-4">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            id="image-upload"
                                        />
                                        <label htmlFor="image-upload" className="cursor-pointer">
                                            <MdUploadFile className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                            <p className="text-sm text-gray-600 mb-1">Click to upload images</p>
                                            <p className="text-xs text-gray-400">PNG, JPG up to 5MB each</p>
                                            <p className="text-xs text-orange-600 mt-1">{imagePreviews.length}/5 uploaded</p>
                                        </label>
                                    </div>
                                )}

                                {/* Image Previews Grid */}
                                {imagePreviews.length > 0 && (
                                    <div className="grid grid-cols-2 gap-3">
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={preview}
                                                    alt={`Preview ${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg"
                                                    onError={(e) => {
                                                        e.target.src = '/Monkey.jpg';
                                                        e.target.onerror = null;
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <MdClose className="w-3 h-3" />
                                                </button>
                                                {index === 0 && (
                                                    <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-orange-500 text-white text-xs rounded">
                                                        Primary
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Preview Card */}
                            {imagePreviews.length > 0 && formData.name && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Preview</h3>
                                    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                                        <img
                                            src={imagePreviews[0]}
                                            alt="Preview"
                                            className="w-full h-48 object-cover"
                                            onError={(e) => {
                                                e.target.src = '/Monkey.jpg';
                                                e.target.onerror = null;
                                            }}
                                        />
                                        <div className="p-4">
                                            <h4 className="font-bold text-gray-900 mb-2">{formData.name}</h4>
                                            <p className="text-xs text-gray-500 mb-3 line-clamp-2">{formData.description}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xl font-bold text-gray-900">₹{formData.price || '0'}</span>
                                                <span className="text-sm text-gray-600">Stock: {formData.stock || '0'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Middle & Right Columns - Form Fields */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Product Name */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Product Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Premium Sparkler Pack"
                                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
                                        required
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
                                        required
                                    >
                                        <option value="">Select category</option>
                                        {categoryOptions.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Price */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Price (₹) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        placeholder="499.00"
                                        step="0.01"
                                        min="0"
                                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
                                        required
                                    />
                                </div>

                                {/* Stock */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Stock Quantity <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleInputChange}
                                        placeholder="100"
                                        min="0"
                                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Number of units available for sale
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Product Description</h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter detailed product description including features, specifications, and safety instructions..."
                                    rows="6"
                                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all resize-none"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Provide a detailed description of the product, including features, specifications, and usage instructions.
                                </p>
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <p className="text-sm text-orange-800">
                                <strong>Note:</strong> Your product will be submitted for admin approval. Once approved, it will be visible to customers on the platform.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={loading}
                                    className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`px-6 py-3 text-white font-semibold rounded-lg transition-all shadow-lg flex items-center gap-2 ${loading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40'
                                        }`}
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <MdCheckCircle className="w-5 h-5" />
                                            Submit Product
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;
