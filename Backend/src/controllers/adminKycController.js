import KYC from "../models/KYC.js";
import Seller from "../models/Seller.js";
import { createNotification } from "../controllers/notificationController.js";

// ================================
// ⭐ REVIEW / APPROVE / REJECT KYC
// ================================
export const reviewKYC = async (req, res) => {
  try {
    const { kycId } = req.params;
    const { status, rejectionReason } = req.body;

    // ✅ Validate status
    const allowedStatuses = ["approved", "rejected"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid KYC status. Allowed values: approved, rejected",
      });
    }

    // ✅ Rejection must include reason
    if (status === "rejected" && !rejectionReason) {
      return res.status(400).json({
        message: "Rejection reason is required when rejecting KYC",
      });
    }

    // Fetch KYC record
    const kyc = await KYC.findById(kycId);
    if (!kyc) {
      return res.status(404).json({ message: "KYC not found" });
    }

    // Update KYC status
    kyc.status = status;
    kyc.rejectionReason =
      status === "rejected" ? rejectionReason : null;

    await kyc.save();

    // Update seller KYC status
    const seller = await Seller.findById(kyc.sellerId);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    seller.kycStatus = status;
    await seller.save();

    // 🔔 Notification — Approved
    if (status === "approved") {
      await createNotification({
        userId: seller._id,
        userType: "seller",
        title: "KYC Approved",
        message: "Congratulations! Your KYC has been approved.",
        type: "kyc",
      });
    }

    // 🔔 Notification — Rejected
    if (status === "rejected") {
      await createNotification({
        userId: seller._id,
        userType: "seller",
        title: "KYC Rejected",
        message: `Your KYC was rejected. Reason: ${rejectionReason}`,
        type: "kyc",
      });
    }

    return res.json({
      message: `KYC ${status}`,
      kyc,
      seller,
    });

  } catch (err) {
    console.error("Admin KYC Review Error:", err);
    return res.status(500).json({
      message: "Failed to review KYC",
      error: err.message,
    });
  }
};

// ========================================
// ⭐ GET ALL PENDING KYCs (ADMIN DASHBOARD)
// ========================================
export const getPendingKYCs = async (req, res) => {
  try {
    const pendingKYCs = await KYC.find({
      status: "pending_review",
    }).populate("sellerId");

    return res.json(pendingKYCs);
  } catch (err) {
    console.error("Get Pending KYCs Error:", err);
    return res.status(500).json({
      message: "Failed to fetch pending KYCs",
      error: err.message,
    });
  }
};
