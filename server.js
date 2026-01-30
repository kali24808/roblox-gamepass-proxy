import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/gamepasses/:creatorId", async (req, res) => {
  const creatorId = req.params.creatorId;

  try {
    const url =
      "https://catalog.roblox.com/v1/search/items/details" +
      "?CreatorTargetId=" + creatorId +
      "&CreatorType=User" +       // IMPORTANT
      "&AssetTypes=34" +          // Gamepass
      "&IncludeNotForSale=false" +
      "&Limit=50";

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Roblox/WinInet",
        "Accept": "application/json"
      }
    });

    const json = await response.json();

    if (!json.data) {
      return res.json([]);
    }

    const passes = json.data
      .filter(p => p.price && p.price > 0)
      .map(p => ({
        id: p.id,
        name: p.name,
        price: p.price
      }));

    res.json(passes);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

app.listen(PORT, () => {
  console.log("✅ Gamepass proxy running on port", PORT);
});
