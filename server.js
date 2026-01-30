import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// Helper: fetch JSON safely
async function fetchJson(url) {
  const res = await fetch(url);
  return await res.json();
}

app.get("/gamepasses/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    let allGames = [];

    // 1️⃣ Player-owned games
    const userGames = await fetchJson(
      `https://games.roblox.com/v2/users/${userId}/games?accessFilter=2&limit=50`
    );

    if (userGames?.data) {
      allGames.push(...userGames.data);
    }

    // 2️⃣ Group games where user is the CREATOR
    const groups = await fetchJson(
      `https://groups.roblox.com/v2/users/${userId}/groups/roles`
    );

    if (groups?.data) {
      for (const group of groups.data) {
        if (group.role.rank === 255) {
          const groupGames = await fetchJson(
            `https://games.roblox.com/v2/groups/${group.group.id}/games?limit=50`
          );

          if (groupGames?.data) {
            allGames.push(...groupGames.data);
          }
        }
      }
    }

    let gamepasses = [];

    // 3️⃣ Get gamepasses from each game
    for (const game of allGames) {
      const passes = await fetchJson(
        `https://games.roblox.com/v1/games/${game.id}/game-passes?limit=100`
      );

      if (passes?.data) {
        for (const pass of passes.data) {
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
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json([]);
  }
});

app.listen(PORT, () => {
  console.log("✅ Gamepass proxy running on port", PORT);
});
