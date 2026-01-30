import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/gamepasses/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    // 1) Get games OWNED by the player (NOT group games)
    const gamesResponse = await fetch(
      `https://games.roblox.com/v2/users/${userId}/games?accessFilter=2&limit=50`
    );
    const gamesData = await gamesResponse.json();

    if (!gamesData || !gamesData.data) {
      return res.json([]);
    }

    let gamepasses = [];

    // 2) For each owned game, fetch its gamepasses
    for (const game of gamesData.data) {
      const passesResponse = await fetch(
        `https://games.roblox.com/v1/games/${game.id}/game-passes?limit=100`
      );
      const passesData = await passesResponse.json();

      if (passesData && passesData.data) {
        for (const pass of passesData.data) {
          if (pass.price && pass.price > 0) {
            gamepasses.push({
              id: pass.id,
              name: pass.displayName,
              price: pass.price
            });
          }
        }
      }
    }

    res.json(gamepasses);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json([]);
  }
});

app.listen(PORT, () => {
  console.log("✅ Gamepass proxy running on port", PORT);
});
