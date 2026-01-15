import Seller from "../models/Seller.js";
import Product from "../models/Product.js";

// Get all active sellers for public viewing
export const getAllPublicSellers = async (req, res) => {
    try {
        console.log('=== Fetching Public Sellers ===');

        // Fetch only active sellers (less restrictive - don't require KYC approval)
        const sellers = await Seller.find({
            status: 'active'
        }).select('name email phone businessName businessType businessAddress createdAt kycStatus');

        console.log(`Found ${sellers.length} active sellers in database`);

        if (sellers.length > 0) {
            console.log('Sample seller:', JSON.stringify(sellers[0], null, 2));
        }

        // Get product count for each seller
        const sellersWithProductCount = await Promise.all(
            sellers.map(async (seller) => {
                const productCount = await Product.countDocuments({
                    sellerId: seller._id,
                    status: { $in: ['approved', 'pending'] },
                    is_deleted: false
                });

                console.log(`Seller: ${seller.businessName}, Products: ${productCount}`);

                return {
                    _id: seller._id,
                    businessName: seller.businessName, // Brand name
                    name: seller.name, // Owner name
                    businessType: seller.businessType,
                    kycStatus: seller.kycStatus,
                    address: {
                        city: seller.businessAddress?.city,
                        state: seller.businessAddress?.state,
                        pincode: seller.businessAddress?.pincode
                    },
                    rating: 4.5, // Default rating
                    totalProducts: productCount,
                    createdAt: seller.createdAt
                };
            })
        );

        // Filter out sellers with no products
        const sellersWithProducts = sellersWithProductCount.filter(s => s.totalProducts > 0);

        console.log(`Returning ${sellersWithProducts.length} sellers with products`);
        console.log('Sellers with products:', sellersWithProducts.map(s => ({
            name: s.businessName,
            products: s.totalProducts
        })));

        res.status(200).json(sellersWithProducts);
    } catch (error) {
        console.error("Error fetching public sellers:", error);
        res.status(500).json({
            message: "Failed to fetch sellers",
            error: error.message
        });
    }
};

// Get single seller public info by ID
export const getPublicSellerById = async (req, res) => {
    try {
        const { sellerId } = req.params;

        const seller = await Seller.findOne({
            _id: sellerId,
            status: 'active'
        }).select('businessName businessType businessAddress createdAt');

        if (!seller) {
            return res.status(404).json({ message: "Seller not found" });
        }

        const productCount = await Product.countDocuments({
            sellerId: seller._id,
            status: { $in: ['approved', 'pending'] },
            is_deleted: false
        });

        res.status(200).json({
            _id: seller._id,
            businessName: seller.businessName,
            businessType: seller.businessType,
            address: {
                city: seller.businessAddress?.city,
                state: seller.businessAddress?.state
            },
            rating: 4.5,
            totalProducts: productCount,
            img: '/images/placeholder.jpg' // Use placeholder for now
        });
    } catch (error) {
        console.error("Error fetching seller details:", error);
        res.status(500).json({ message: "Error fetching seller details" });
    }
};
