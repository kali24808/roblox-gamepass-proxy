import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

async function fetchJSON(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Roblox-Gamepass-Proxy",
      "Cache-Control": "no-cache"
    }
  });
  return res.json();
}

app.get("/gamepasses/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    // 1️⃣ get games created by user
    const gamesUrl =
      `https://games.roblox.com/v2/users/${userId}/games?limit=50&sortOrder=Asc`;

    const gamesJson = await fetchJSON(gamesUrl);
    if (!gamesJson.data) return res.json([]);

    let passes = [];

    // 2️⃣ get gamepasses for each game
    for (const game of gamesJson.data) {
      const gameId = game.id;

      const passesUrl =
        `https://games.roblox.com/v1/games/${gameId}/game-passes?limit=100&sortOrder=Asc`;

      const passJson = await fetchJSON(passesUrl);

      if (passJson.data) {
        for (const pass of passJson.data) {
          if (pass.price && pass.price > 0) {
            passes.push({
              id: pass.id,
              name: pass.displayName,
              price: pass.price
            });
          }
        }
      }
    }

    res.json(passes);
  } catch (err) {
    console.error("Proxy error:", err);
    res.json([]);
  }
});

app.listen(PORT, () => {
  console.log("✅ Gamepass proxy running on port", PORT);
});
