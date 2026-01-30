import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

async function fetchGamepasses(userId) {
  const url =
    "https://catalog.roblox.com/v1/search/items/details" +
    "?CreatorTargetId=" + userId +
    "&CreatorType=User" +
    "&AssetTypes=34" +
    "&IncludeNotForSale=false" +
    "&Limit=50";

  const response = await fetch(url, {
    headers: {
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
      "User-Agent": "Roblox-Gamepass-Proxy"
    }
  });

  const json = await response.json();
  return json.data || [];
}

app.get("/gamepasses/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    let data = await fetchGamepasses(userId);

    // 🔁 retry once if Roblox returns empty
    if (data.length === 0) {
      await new Promise(r => setTimeout(r, 500));
      data = await fetchGamepasses(userId);
    }

    const passes = data
      .filter(item => item.price && item.price > 0)
      .map(item => ({
        id: item.id,
        name: item.name,
        price: item.price
      }));

    res.json(passes);
  } catch (err) {
    console.error("Proxy error:", err);
    res.json([]);
  }
});

app.listen(PORT, () => {
  console.log("✅ Gamepass proxy running on port", PORT);
});
