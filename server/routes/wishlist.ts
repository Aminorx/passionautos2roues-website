import { Router } from "express";
import { storage } from "../storage";
import { insertWishlistSchema } from "../../shared/schema.js";
import { z } from "zod";

const router = Router();

// Get user's wishlist
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const wishlist = await storage.getUserWishlist(userId);
    res.json(wishlist);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ error: "Failed to fetch wishlist" });
  }
});

// Add to wishlist
router.post("/", async (req, res) => {
  try {
    const validatedData = insertWishlistSchema.parse(req.body);
    const wishlistItem = await storage.addToWishlist(validatedData);
    res.json(wishlistItem);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid data", details: error.errors });
    } else {
      console.error("Error adding to wishlist:", error);
      res.status(500).json({ error: "Failed to add to wishlist" });
    }
  }
});

// Remove from wishlist
router.delete("/:userId/:vehicleId", async (req, res) => {
  try {
    const { userId, vehicleId } = req.params;
    const success = await storage.removeFromWishlist(userId, vehicleId);
    if (success) {
      res.json({ message: "Removed from wishlist" });
    } else {
      res.status(404).json({ error: "Item not found in wishlist" });
    }
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({ error: "Failed to remove from wishlist" });
  }
});

// Check if item is in wishlist
router.get("/:userId/:vehicleId/check", async (req, res) => {
  try {
    const { userId, vehicleId } = req.params;
    const isInWishlist = await storage.isInWishlist(userId, vehicleId);
    res.json({ isInWishlist });
  } catch (error) {
    console.error("Error checking wishlist:", error);
    res.status(500).json({ error: "Failed to check wishlist" });
  }
});

export default router;