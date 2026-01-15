import Payout from "../models/Payout.js";
import { sendNotification } from "../utils/sendNotification.js";   // ⭐ IMPORTANT


// ⭐ SELLER — GET ALL PAYOUTS
export const getSellerPayouts = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const payouts = await Payout.find({ sellerId })
      .populate("orderId");

    res.json(payouts);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// ⭐ ADMIN — GET ALL PAYOUTS
export const getAllPayouts = async (req, res) => {
  try {
    const payouts = await Payout.find()
      .populate("sellerId")
      .populate("orderId");

    res.json(payouts);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// ⭐ ADMIN — MARK PAYOUT AS PAID + SEND NOTIFICATION
export const markPayoutPaid = async (req, res) => {
  try {
    const { payoutId } = req.params;

    const payout = await Payout.findById(payoutId);
    if (!payout) return res.status(404).json({ message: "Payout not found" });

    payout.status = "paid";
    await payout.save();


    // ⭐ SEND NOTIFICATION TO SELLER
    await sendNotification(
      payout.sellerId,
      "Seller",
      "Payout Released",
      `Your payout of ₹${payout.netAmount} has been released.`,
      "payout"
    );


    res.json({ message: "Payout marked as paid", payout });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
