import type { Mission } from "@/types";

interface Props {
  mission: Mission;
  revealed: boolean;
  selectedId: string | null;
  wrongIds: string[];
  onSelect: (id: string) => void;
}

export function PlaceholderRenderer({ mission, revealed, selectedId, wrongIds, onSelect }: Props) {
  return (
    <div className="space-y-4 w-full">
      {/* story panel */}
      <div className="surface-panel rounded-3xl p-5 mb-6 border-dashed">
        <div className="mb-2 inline-block px-3 py-1 rounded-full bg-[#E8DCC2] border-2 border-[#CBB794] text-[#5A3515] text-[10px] font-black uppercase tracking-widest">
          {mission.missionType.replace('_', ' ')}
        </div>
        <h1 className="font-display font-black text-2xl text-[#5A3515] leading-tight">{mission.title}</h1>
        <p className="mt-2 text-base font-bold leading-relaxed text-[#8C6B45]">{mission.story}</p>
      </div>

      {/* instruction */}
      <div className="font-display font-black text-xl text-[#185E9F] px-2 mb-3 text-center bg-white/40 border-2 border-white/60 py-3 rounded-2xl shadow-sm">
        {mission.instruction}
      </div>

      <div className="surface-panel rounded-3xl p-6 text-center space-y-4">
        <div className="text-4xl animate-float">🚧</div>
        <h3 className="font-display font-black text-xl text-[#5A3515]">Mini-game Belum Siap</h3>
        <p className="text-sm font-bold text-[#8C6B45]">
          Tipe misi ini masih dalam pengembangan. Untuk saat ini, silakan tekan tombol di bawah untuk simulasi menang atau kalah.
        </p>

        <div className="flex gap-3 justify-center mt-4">
          <button type="button" data-action="primary"
            disabled={revealed}
            onClick={() => onSelect("WIN_SIMULATION")}
            className="tmt-action-button flex-1 px-4 py-3 rounded-2xl bg-gradient-meadow text-white border-b-4 border-[#2E8B12] font-black shadow-sm active:translate-y-1 active:border-b-0 disabled:opacity-50"
          >
            Simulasi Menang
          </button>
          <button type="button" data-action="danger"
            disabled={revealed}
            onClick={() => onSelect("LOSE_SIMULATION")}
            className="tmt-action-button flex-1 px-4 py-3 rounded-2xl bg-gradient-heart text-white border-b-4 border-[#A02020] font-black shadow-sm active:translate-y-1 active:border-b-0 disabled:opacity-50"
          >
            Simulasi Kalah
          </button>
        </div>
      </div>
    </div>
  );
}
