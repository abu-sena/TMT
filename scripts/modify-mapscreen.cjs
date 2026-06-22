const fs = require('fs');

let content = fs.readFileSync('src/screens/MapScreen.tsx', 'utf-8');

// 1. Add popup state and modal import
content = content.replace(
  /import \{ cn \} from "@\/lib\/utils";/,
  `import { cn } from "@/lib/utils";\nimport { CATEGORY_MAP } from "@/data/constants";`
);

// Add selectedMission state
content = content.replace(
  /const \[activeSegmentIndex, setActiveSegmentIndex\] = useState\(currentWorldIndex\);/,
  `const [activeSegmentIndex, setActiveSegmentIndex] = useState(currentWorldIndex);\n  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);`
);

// Update MapSegment to set selectedMission instead of onOpenMission directly
content = content.replace(
  /<MapSegment \n\s*missions=\{segmentMissions\}\n\s*profile=\{profile\}\n\s*world=\{activeWorld\}\n\s*highestCompleted=\{highestCompleted\}\n\s*isUnlocked=\{isSegmentUnlocked\}\n\s*onOpenMission=\{onOpenMission\}\n\s*\/>/g,
  `<MapSegment 
          missions={segmentMissions}
          profile={profile}
          world={activeWorld}
          highestCompleted={highestCompleted}
          isUnlocked={isSegmentUnlocked}
          onOpenMission={setSelectedMission}
        />`
);

// Add popup JSX
const popupJSX = `
      {selectedMission && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={() => setSelectedMission(null)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm border-4 border-[#8C6B45] shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button 
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-stone-200 text-stone-600 font-bold flex items-center justify-center hover:bg-stone-300"
              onClick={() => setSelectedMission(null)}
            >
              ✕
            </button>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-[#5A3515] font-display mb-1">
                Stage {selectedMission.number}
              </h2>
              <div className="inline-flex items-center gap-2 bg-stone-100 px-3 py-1.5 rounded-full text-sm font-bold text-stone-600 mb-4">
                <span>{CATEGORY_MAP[selectedMission.category]?.emoji || "🎮"}</span>
                <span>Jenis: {CATEGORY_MAP[selectedMission.category]?.short || selectedMission.category}</span>
              </div>
              <p className="text-lg text-[#8C6B45] font-bold">
                Tantangan:<br/>
                <span className="text-[#E91E63]">{selectedMission.challengeType?.replace(/_/g, " ").toUpperCase() || selectedMission.missionType.replace(/_/g, " ").toUpperCase()}</span>
              </p>
            </div>
            <GameButton variant="primary" size="xl" full onClick={() => {
              const m = selectedMission;
              setSelectedMission(null);
              onOpenMission(m);
            }}>
              Mulai Petualangan
            </GameButton>
          </div>
        </div>
      )}
`;

// Insert popup JSX before closing GameScreen
content = content.replace(
  /<\/GameScreen>/,
  popupJSX + '\n    </GameScreen>'
);

fs.writeFileSync('src/screens/MapScreen.tsx', content, 'utf-8');
console.log('Done modifying MapScreen.tsx');
