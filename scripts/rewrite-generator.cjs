const fs = require('fs');

let content = fs.readFileSync('src/data/stage-generator.ts', 'utf-8');

// Update generateParametrizedStage signature
content = content.replace(
  /function generateParametrizedStage\([\s\S]*?\): Stage \{/,
  `function generateParametrizedStage(
  tpl: StageTemplate,
  difficulty: DifficultyId,
  stageNumber: number,
  mapSegmentId: string,
  backgroundTheme: string,
  category: CategoryId,
  stageType: StageType,
  rand: () => number,
  isBoss: boolean,
): Stage {`
);

// Update generateParametrizedStage body
content = content.replace(
  /worldId,\s*worldName,\s*category,\s*stageType,\s*missionType: tpl\.missionType,/,
  `mapSegmentId,
    backgroundTheme,
    category,
    stageType,
    challengeType: tpl.missionType as any,
    missionType: tpl.missionType,`
);

// Replace legacy compat in generateParametrizedStage
content = content.replace(
  /worldArea: worldId,/,
  `worldArea: mapSegmentId,`
);

// Replace generateStagesForDifficulty function
const newGenLogic = `export function generateStagesForDifficulty(difficulty: DifficultyId): Stage[] {
  const worlds = WORLDS_BY_DIFFICULTY[difficulty];
  if (!worlds) return [];

  const templates = TEMPLATE_BANK[difficulty];
  if (!templates) return [];

  const availableCategories = Object.keys(templates) as CategoryId[];
  const rand = rng(difficulty.split("").reduce((a, c) => a + c.charCodeAt(0), 0) * 12345);

  const stages: Stage[] = [];
  const seenIds = new Set<string>();

  let globalStageNum = 0;
  let lastAdabStage = 0;
  const recentCategories: CategoryId[] = [];
  const recentMissionTypes: string[] = [];

  for (const world of worlds) {
    const worldStageCount = world.stageRange[1] - world.stageRange[0] + 1;
    for (let i = 0; i < worldStageCount; i++) {
      globalStageNum++;
      const stageNum = globalStageNum;
      const isBoss = world.bossStages.includes(stageNum);
      const stageType: StageType = isBoss ? "boss" : (i + 1 === worldStageCount && worldStageCount > 10 ? "review" : "mission");

      // Adab mixing
      let categoryChoice: CategoryId;
      const adabCategories = availableCategories.filter(c => c.includes("adab") || c === "moral" || c === "ethical-leadership");
      const shouldForceAdab = adabCategories.length > 0 && (stageNum - lastAdabStage >= randInt(4, 6, rand));

      if (shouldForceAdab) {
        categoryChoice = pick(adabCategories, rand);
        lastAdabStage = stageNum;
      } else {
        let validCats = availableCategories.filter(c => !adabCategories.includes(c));
        if (validCats.length === 0) validCats = availableCategories;

        // No 3 consecutive same categories
        if (recentCategories.length >= 2 && recentCategories[0] === recentCategories[1]) {
          validCats = validCats.filter(c => c !== recentCategories[0]);
        }

        // Alternating logic/spatial
        const lastCat = recentCategories[recentCategories.length - 1];
        if (lastCat === "spasial" && validCats.includes("penalaran" as CategoryId)) {
          validCats.push("penalaran" as CategoryId, "penalaran" as CategoryId);
        } else if (lastCat === "penalaran" && validCats.includes("spasial" as CategoryId)) {
          validCats.push("spasial" as CategoryId, "spasial" as CategoryId);
        }

        if (validCats.length === 0) validCats = availableCategories;
        categoryChoice = pick(validCats, rand);
      }

      const catTemplates = templates[categoryChoice];
      let validTpls = catTemplates;
      
      // No 3 consecutive same challengeTypes
      if (recentMissionTypes.length >= 2 && recentMissionTypes[0] === recentMissionTypes[1]) {
        validTpls = catTemplates.filter(t => t.missionType !== recentMissionTypes[0]);
        if (validTpls.length === 0) validTpls = catTemplates;
      }

      const tpl = pick(validTpls, rand);

      recentCategories.push(categoryChoice);
      if (recentCategories.length > 5) recentCategories.shift();
      recentMissionTypes.push(tpl.missionType);
      if (recentMissionTypes.length > 2) recentMissionTypes.shift();

      const stage = generateParametrizedStage(
        tpl,
        difficulty,
        stageNum,
        world.id,
        world.backgroundTheme,
        categoryChoice,
        stageType,
        rand,
        isBoss
      );

      if (seenIds.has(stage.id)) {
        stage.id = \`\${difficulty}-\${stageNum}-\${i}\`;
      }
      seenIds.add(stage.id);
      stages.push(stage);
    }
  }

  stages.sort((a, b) => a.stageNumber - b.stageNumber);
  return stages;
}
`;

// Replace the old generateStagesForDifficulty block completely
const startIdx = content.indexOf('export function generateStagesForDifficulty');
const endIdx = content.indexOf('export function generateAllStages');
if (startIdx !== -1 && endIdx !== -1) {
  content = content.substring(0, startIdx) + newGenLogic + content.substring(endIdx);
}

// Now update stageToMission compat mapping
content = content.replace(
  /worldArea: stage\.worldId,/,
  `worldArea: stage.mapSegmentId,
    mapSegmentId: stage.mapSegmentId,
    backgroundTheme: stage.backgroundTheme,
    challengeType: stage.challengeType,`
);

fs.writeFileSync('src/data/stage-generator.ts', content, 'utf-8');
console.log('Done refactoring stage-generator.ts');
