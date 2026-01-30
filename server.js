import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/gamepasses/:userId", async (req, res) => {
  const userId = req.params.userId;
  const gamepasses = [];

  try {
    // 1️⃣ Get user's owned games
    const gamesRes = await fetch(
      `https://games.roblox.com/v2/users/${userId}/games?limit=50&sortOrder=Asc`
    );
    const games = await gamesRes.json();

    if (!games.data) {
      return res.json([]);
    }

    // 2️⃣ Get gamepasses for each game
    for (const game of games.data) {
      const passRes = await fetch(
        `https://games.roblox.com/v1/games/${game.id}/game-passes?limit=100`
      );
      const passData = await passRes.json();

      if (!passData.data) continue;

      for (const pass of passData.data) {
        if (pass.price && pass.price > 0) {
          gamepasses.push({
            id: pass.id,
            name: pass.displayName,
            price: pass.price
          });
        }
      }
    }

    res.json(gamepasses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch gamepasses" });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
});
