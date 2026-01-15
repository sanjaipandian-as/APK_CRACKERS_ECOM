export const sellerGuard = (req, res, next) => {
  // Must be seller
  if (req.role !== "seller") {
    return res.status(403).json({
      message: "Access denied. Seller account required.",
    });
  }

  // Blocked seller
  if (req.user?.isBlocked === true) {
    return res.status(403).json({
      message: "Your seller account is blocked. Contact support.",
    });
  }

  // Seller must have approved KYC
  if (req.user?.kycStatus !== "approved") {
    return res.status(403).json({
      message: "Your KYC is not approved. Complete KYC to continue.",
    });
  }

  next();
};
