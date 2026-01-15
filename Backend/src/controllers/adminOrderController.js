import Order from "../models/Order.js";

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customerId")
      .populate("sellerId")
      .populate("items.productId");

    res.json(orders);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getOrdersByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    const orders = await Order.find({ status })
      .populate("customerId")
      .populate("sellerId")
      .populate("items.productId");

    res.json(orders);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const adminUpdateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const allowedStatus = ["pending_payment", "paid", "packed", "shipped", "delivered", "cancelled"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    res.json({
      message: `Order status updated to ${status} by Admin`,
      order
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = "cancelled";
    order.paymentStatus = "failed";
    await order.save();

    res.json({ message: "Order cancelled successfully", order });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};