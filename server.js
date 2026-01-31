import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

async function safeFetch(url) {
  console.log("FETCH:", url);
  const res = await fetch(url);
  if (!res.ok) {
    console.error("FAILED:", res.status);
    return null;
  }
  return res.json();
}

app.get("/gamepasses/:userId", async (req, res) => {
  const userId = req.params.userId;
  console.log("REQUEST USER:", userId);

  try {
    // 1️⃣ Get games created by user
    const games = await safeFetch(
      `https://games.roblox.com/v2/users/${userId}/games?accessFilter=Public&limit=50`
    );

    if (!games || !games.data || games.data.length === 0) {
      console.log("NO GAMES FOUND");
      return res.json([]);
    }

    let passes = [];

    // 2️⃣ For each game, fetch gamepasses
    for (const game of games.data) {
      console.log("GAME:", game.name, game.id);

      const gp = await safeFetch(
        `https://games.roblox.com/v1/games/${game.id}/game-passes?limit=100`
      );

      if (!gp || !gp.data) {
        console.log("NO PASSES FOR GAME:", game.id);
        continue;
      }

      for (const pass of gp.data) {
        if (pass.price && pass.price > 0) {
          console.log("PASS:", pass.name, pass.price);
          passes.push({
            id: pass.id,
            name: pass.displayName,
            price: pass.price
          });
        }
      }
    }

    console.log("TOTAL PASSES:", passes.length);
    res.json(passes);

  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json([]);
  }
});

app.listen(PORT, () => {
  console.log("Gamepass proxy DEBUG running on port", PORT);
});
