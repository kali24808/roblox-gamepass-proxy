import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

const HEADERS = {
  "User-Agent": "Mozilla/5.0 RobloxProxy",
  "Accept": "application/json"
};

app.get("/gamepasses/:userId", async (req, res) => {
  const userId = req.params.userId;

  const debug = {
    userId,
    requestUrl: "",
    rawCount: 0,
    returnedCount: 0,
    rawIds: []
  };

  try {
    const url =
      "https://catalog.roblox.com/v1/search/items/details" +
      "?CreatorTargetId=" + userId +
      "&CreatorType=User" +
      "&AssetTypes=34" +          // GamePass
      "&IncludeNotForSale=true" + // important
      "&Limit=50";

    debug.requestUrl = url;

    const response = await fetch(url, { headers: HEADERS });
    const json = await response.json();

    if (!json.data) {
      return res.json({ debug, passes: [] });
    }

    debug.rawCount = json.data.length;
    debug.rawIds = json.data.map(i => i.id);

    const passes = json.data
      .filter(item => typeof item.price === "number" && item.price > 0)
      .map(item => ({
        id: item.id,
        name: item.name,
        price: item.price
      }));

    debug.returnedCount = passes.length;

    res.json({
      debug,
      passes
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Proxy error",
      debug
    });
  }
});

app.listen(PORT, () => {
  console.log("✅ User gamepass proxy running on port", PORT);
});
