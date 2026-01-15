import Order from "../models/Order.js";
import Payout from "../models/Payout.js";
import Product from "../models/Product.js";

export const getSellerDashboard = async (req, res) => {
  try {
    const sellerId = req.user._id;

    // Total orders
    const orders = await Order.find({ sellerId });

    const totalOrders = orders.length;

    // Delivered orders
    const deliveredOrders = orders.filter(o => o.status === "delivered").length;

    // Pending orders
    const pendingOrders = orders.filter(o =>
      ["paid", "packed", "shipped"].includes(o.status)
    ).length;

    // Revenue after commission (using payout table)
    const payouts = await Payout.find({ sellerId, status: "paid" });

    const totalEarnings = payouts.reduce((sum, p) => sum + p.netAmount, 0);

    // Best selling products
    const allItems = orders.flatMap(order => order.items);

    let productSales = {};
    allItems.forEach(item => {
      const id = item.productId.toString();
      productSales[id] = (productSales[id] || 0) + item.quantity;
    });

    const sortedProducts = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5); // Top 5

    res.json({
      totalOrders,
      deliveredOrders,
      pendingOrders,
      totalEarnings,
      bestSellingProducts: sortedProducts
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
