import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/gamepasses/:userId", async (req, res) => {
  const userId = req.params.userId;

  let debug = {
    userId,
    gamesFetched: false,
    gamesCount: 0,
    gameIds: [],
    passesPerGame: {},
    totalPasses: 0,
    errors: []
  };

  try {
    // STEP 1: Fetch user's games
    const gamesUrl =
      `https://games.roblox.com/v2/users/${userId}/games?accessFilter=2&limit=50`;

    const gamesRes = await fetch(gamesUrl);
    const gamesJson = await gamesRes.json();

    debug.gamesFetched = true;

    if (!gamesJson.data) {
      debug.errors.push("No gamesJson.data");
      return res.json({ debug, passes: [] });
    }

    debug.gamesCount = gamesJson.data.length;

    // STEP 2: For each game, fetch gamepasses
    let passes = [];

    for (const game of gamesJson.data) {
      debug.gameIds.push(game.id);

      const passUrl =
        `https://games.roblox.com/v1/games/${game.id}/game-passes?limit=100`;

      const passRes = await fetch(passUrl);
      const passJson = await passRes.json();

      debug.passesPerGame[game.id] =
        passJson.data ? passJson.data.length : 0;

      if (!passJson.data) continue;

      for (const pass of passJson.data) {
        if (pass.price && pass.price > 0) {
          passes.push({
            id: pass.id,
            name: pass.displayName,
            price: pass.price,
            gameId: game.id
          });
        }
      }
    }

    debug.totalPasses = passes.length;

    res.json({ debug, passes });
  } catch (err) {
    debug.errors.push(err.message);
    res.status(500).json({ debug, passes: [] });
  }
});

app.listen(PORT, () => {
  console.log("🧪 DEBUG proxy running on port", PORT);
});
