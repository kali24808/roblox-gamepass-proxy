import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/gamepasses/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    // 1️⃣ Get USER-OWNED public games
    const gamesRes = await fetch(
      `https://games.roblox.com/v2/users/${userId}/games?accessFilter=2&limit=50`
    );
    const gamesJson = await gamesRes.json();

    if (!gamesJson.data) return res.json([]);

    let passes = [];

    // 2️⃣ Get gamepasses from each game
    for (const game of gamesJson.data) {
      const passesRes = await fetch(
        `https://games.roblox.com/v1/games/${game.id}/game-passes?limit=100`
      );
      const passesJson = await passesRes.json();

      if (passesJson.data) {
        for (const pass of passesJson.data) {
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
    console.error(err);
    res.status(500).json([]);
  }
});

app.listen(PORT, () => {
  console.log("✅ User gamepass proxy running on port", PORT);
});
