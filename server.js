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

async function getGamepassesFromGames(games) {
  let passes = [];

  for (const game of games) {
    const gameId = game.id;
    const url =
      `https://games.roblox.com/v1/games/${gameId}/game-passes?limit=100`;

    const json = await fetchJSON(url);
    if (!json.data) continue;

    for (const pass of json.data) {
      if (pass.price && pass.price > 0) {
        passes.push({
          id: pass.id,
          name: pass.displayName,
          price: pass.price
        });
      }
    }
  }

  return passes;
}

app.get("/gamepasses/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    let allPasses = [];

    // 1️⃣ USER-OWNED GAMES
    const userGames =
      await fetchJSON(`https://games.roblox.com/v2/users/${userId}/games?limit=50`);

    if (userGames.data) {
      allPasses.push(
        ...(await getGamepassesFromGames(userGames.data))
      );
    }

    // 2️⃣ GROUPS USER OWNS
    const groups =
      await fetchJSON(`https://groups.roblox.com/v2/users/${userId}/groups/roles`);

    if (groups.data) {
      for (const g of groups.data) {
        if (g.role.rank >= 200) { // owner / admin
          const groupId = g.group.id;

          const groupGames =
            await fetchJSON(
              `https://games.roblox.com/v2/groups/${groupId}/games?limit=50`
            );

          if (groupGames.data) {
            allPasses.push(
              ...(await getGamepassesFromGames(groupGames.data))
            );
          }
        }
      }
    }

    res.json(allPasses);
  } catch (err) {
    console.error("Proxy error:", err);
    res.json([]);
  }
});

app.listen(PORT, () => {
  console.log("✅ Gamepass proxy running on port", PORT);
});
