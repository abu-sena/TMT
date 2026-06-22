import { MINI_GAMES, getMiniGamesByPackage } from "../src/data/minigame-definitions";

function runValidation() {
  console.log("=== Validating Spatial Mini-games ===");
  let errors = 0;

  const spatialGames = getMiniGamesByPackage("spasial");

  // 1. Check exactly 3 games
  if (spatialGames.length !== 3) {
    console.error(`Expected exactly 3 spatial games, found ${spatialGames.length}`);
    errors++;
  }

  // 2. Check for required games
  const requiredIds = ["ubah-posisi", "cocok-bayangan", "jalur-tercepat"];
  requiredIds.forEach(id => {
    if (!spatialGames.find(g => g.id === id)) {
      console.error(`Missing required spatial game: ${id}`);
      errors++;
    }
  });

  // 3. Check for removed old games
  const oldIds = ["putar-bentuk", "jalur-aman", "susun-puzzle"];
  oldIds.forEach(id => {
    if (MINI_GAMES.find(g => g.id === id)) {
      console.error(`Old game ${id} should be removed or inactive.`);
      errors++;
    }
  });

  // 4. Validate routes and components
  spatialGames.forEach(g => {
    if (!g.screenId) {
      console.error(`Game ${g.id} is missing screenId for routing`);
      errors++;
    }
  });

  if (errors === 0) {
    console.log("✅ Spatial Mini-games validation PASSED!");
  } else {
    console.error(`❌ Spatial Mini-games validation FAILED with ${errors} errors.`);
    process.exit(1);
  }
}

runValidation();
