import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/debug/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const url =
      "https://catalog.roblox.com/v1/search/items/details" +
      "?CreatorTargetId=" + userId +
      "&AssetTypes=34" +
      "&Limit=50";

    const r = await fetch(url);
    const json = await r.json();

    res.json(json); // 🔴 RAW RESPONSE
  } catch (e) {
    res.json({ error: e.toString() });
  }
});

app.listen(PORT, () => console.log("DEBUG proxy running"));
