import Seller from "../models/Seller.js";

export const blockSeller = async (req, res) => {
  try {
    const { sellerId } = req.params;

    const seller = await Seller.findByIdAndUpdate(
      sellerId,
      { status: "blocked" },
      { new: true }
    );

    if (!seller) return res.status(404).json({ message: "Seller not found" });

    res.json({
      message: "Seller has been blocked",
      seller
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const unblockSeller = async (req, res) => {
  try {
    const { sellerId } = req.params;

    const seller = await Seller.findByIdAndUpdate(
      sellerId,
      { status: "active" },
      { new: true }
    );

    if (!seller) return res.status(404).json({ message: "Seller not found" });

    res.json({
      message: "Seller has been unblocked",
      seller
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getAllSellers = async (req, res) => {
  try {
    const sellers = await Seller.find().sort({ createdAt: -1 });
    res.json(sellers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
