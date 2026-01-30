import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/gamepasses/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const url =
      "https://catalog.roblox.com/v1/search/items/details" +
      "?CreatorTargetId=" + userId +
      "&AssetTypes=34" +
      "&IncludeNotForSale=false" +
      "&Limit=30";

    const response = await fetch(url);
    const data = await response.json();

    if (!data.data) {
      return res.json([]);
    }

    const passes = data.data
      .filter(item => item.price && item.price > 0)
      .map(item => ({
        id: item.id,
        name: item.name,
        price: item.price
      }));

    res.json(passes);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

app.listen(PORT, () => {
  console.log("Gamepass proxy running on port", PORT);
});
