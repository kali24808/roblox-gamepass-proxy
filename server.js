import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * GET /gamepasses/:userId
 * Returns ALL gamepasses created by games owned by the user
 */
app.get("/gamepasses/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    // 1️⃣ Get games created by the user
    const gamesRes = await fetch(
      `https://games.roblox.com/v2/users/${userId}/games?accessFilter=2&limit=50`
    );
    const gamesJson = await gamesRes.json();

    if (!gamesJson.data) {
      return res.json([]);
    }

    let passes = [];

    // 2️⃣ For each game, fetch its gamepasses
    for (const game of gamesJson.data) {
      const gameId = game.id;

      const passRes = await fetch(
        `https://games.roblox.com/v1/games/${gameId}/game-passes?limit=100`
      );
      const passJson = await passRes.json();

      if (!passJson.data) continue;

      for (const pass of passJson.data) {
        if (pass.price && pass.price > 0) {
          passes.push({
            id: pass.id,
            name: pass.displayName,
            price: pass.price,
            gameId: gameId
          });
        }
      }
    }

    res.json(passes);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json([]);
  }
});

app.listen(PORT, () => {
  console.log("✅ Gamepass proxy running on port", PORT);
});
