import Order from "../models/Order.js";
import Payout from "../models/Payout.js";
import Seller from "../models/Seller.js";
import Customer from "../models/Customer.js";

export const getAdminDashboard = async (req, res) => {
  try {
    // Overall order count
    const orders = await Order.find();

    const totalOrders = orders.length;
    const deliveredOrders = orders.filter(o => o.status === "delivered").length;

    // Platform revenue (commission)
    const payouts = await Payout.find();
    const totalCommission = payouts.reduce((sum, p) => sum + p.commission, 0);

    // Count sellers & customers
    const totalSellers = await Seller.countDocuments();
    const totalCustomers = await Customer.countDocuments();

    // Total sales amount (sum of all paid orders)
    const totalSales = orders
      .filter(o => o.paymentStatus === "success")
      .reduce((sum, o) => sum + o.totalAmount, 0);

    res.json({
      totalOrders,
      deliveredOrders,
      totalSales,
      totalCommission,
      totalSellers,
      totalCustomers
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getDailySales = async (req, res) => {
  try {
    const orders = await Order.find({
      paymentStatus: "success"
    });

    let daily = {};

    orders.forEach(order => {
      const day = order.createdAt.toISOString().split("T")[0];
      daily[day] = (daily[day] || 0) + order.totalAmount;
    });

    res.json(daily);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};