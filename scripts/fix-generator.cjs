const fs = require('fs');
let content = fs.readFileSync('src/data/stage-generator.ts', 'utf-8');

// Fix recentCategories logic
content = content.replace(
  /if \(recentCategories\.length >= 2 && recentCategories\[0\] === recentCategories\[1\]\) \{/g,
  `const len = recentCategories.length;
        if (len >= 2 && recentCategories[len - 1] === recentCategories[len - 2]) {`
);
content = content.replace(
  /validCats = validCats\.filter\(c => c !== recentCategories\[0\]\);/g,
  `validCats = validCats.filter(c => c !== recentCategories[len - 1]);`
);

// Fix recentMissionTypes logic
content = content.replace(
  /if \(recentMissionTypes\.length >= 2 && recentMissionTypes\[0\] === recentMissionTypes\[1\]\) \{/g,
  `const lenMt = recentMissionTypes.length;
      if (lenMt >= 2 && recentMissionTypes[lenMt - 1] === recentMissionTypes[lenMt - 2]) {`
);
content = content.replace(
  /validTpls = catTemplates\.filter\(t => t\.missionType !== recentMissionTypes\[0\]\);/g,
  `validTpls = catTemplates.filter(t => t.missionType !== recentMissionTypes[lenMt - 1]);`
);

fs.writeFileSync('src/data/stage-generator.ts', content, 'utf-8');
console.log('Fixed generator logic.');
