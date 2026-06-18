/**
 * SoundService — Simple sound effect service
 * 
 * Uses Web Audio API with generated tones as fallback.
 * For production, replace with actual sound files in assets/sounds/
 * 
 * Sound files needed (place in assets/sounds/):
 * - button_click.mp3
 * - answer_correct.mp3
 * - answer_wrong.mp3
 * - mission_start.mp3
 * - star_earned.mp3
 * - level_up.mp3
 * - badge_unlock.mp3
 * - success_complete.mp3
 * - popup_open.mp3
 * - popup_close.mp3
 * - soft_error.mp3
 * 
 * All sounds should be royalty-free/CC0.
 * Recommended sources: Pixabay Sound Effects, Freesound.org (CC0), OpenGameArt
 */

type SoundName =
  | "button_click"
  | "back_click"
  | "popup_open"
  | "popup_close"
  | "mission_start"
  | "answer_correct"
  | "answer_wrong"
  | "star_earned"
  | "points_count"
  | "badge_unlock"
  | "level_up"
  | "map_node_unlock"
  | "daily_reward"
  | "soft_error"
  | "success_complete";

class SoundService {
  private enabled = true;
  private volume = 0.3;
  private audioContext: AudioContext | null = null;
  private buffers: Map<SoundName, AudioBuffer> = new Map();
  private soundPaths: Record<SoundName, string> = {
    button_click: "assets/sounds/button_click.mp3",
    back_click: "assets/sounds/back_click.mp3",
    popup_open: "assets/sounds/popup_open.mp3",
    popup_close: "assets/sounds/popup_close.mp3",
    mission_start: "assets/sounds/mission_start.mp3",
    answer_correct: "assets/sounds/answer_correct.mp3",
    answer_wrong: "assets/sounds/answer_wrong.mp3",
    star_earned: "assets/sounds/star_earned.mp3",
    points_count: "assets/sounds/points_count.mp3",
    badge_unlock: "assets/sounds/badge_unlock.mp3",
    level_up: "assets/sounds/level_up.mp3",
    map_node_unlock: "assets/sounds/map_node_unlock.mp3",
    daily_reward: "assets/sounds/daily_reward.mp3",
    soft_error: "assets/sounds/soft_error.mp3",
    success_complete: "assets/sounds/success_complete.mp3",
  };

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  /**
   * Generate a simple tone as fallback when sound files aren't available
   */
  private generateTone(frequency: number, duration: number, type: OscillatorType = "sine") {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Silently fail — audio is not critical
    }
  }

  /**
   * Play a named sound effect
   */
  async play(name: SoundName) {
    if (!this.enabled) return;

    // Try to load and play the actual sound file
    try {
      const buffer = await this.loadSound(name);
      if (buffer) {
        this.playBuffer(buffer);
        return;
      }
    } catch (e) {
      // File not found — use generated tone as fallback
    }

    // Fallback: generate simple tones for different sound types
    switch (name) {
      case "button_click":
        this.generateTone(800, 0.05, "square");
        break;
      case "back_click":
        this.generateTone(400, 0.05, "triangle");
        break;
      case "popup_open":
        this.generateTone(600, 0.1, "sine");
        break;
      case "popup_close":
        this.generateTone(500, 0.08, "sine");
        break;
      case "answer_correct":
        this.generateTone(523, 0.1, "sine");
        setTimeout(() => this.generateTone(659, 0.1, "sine"), 100);
        setTimeout(() => this.generateTone(784, 0.15, "sine"), 200);
        break;
      case "answer_wrong":
        this.generateTone(200, 0.2, "sawtooth");
        break;
      case "star_earned":
        this.generateTone(880, 0.15, "sine");
        break;
      case "badge_unlock":
        this.generateTone(440, 0.1, "triangle");
        setTimeout(() => this.generateTone(554, 0.1, "triangle"), 100);
        setTimeout(() => this.generateTone(659, 0.2, "triangle"), 200);
        break;
      case "level_up":
        this.generateTone(330, 0.1, "sine");
        setTimeout(() => this.generateTone(440, 0.1, "sine"), 100);
        setTimeout(() => this.generateTone(523, 0.1, "sine"), 200);
        setTimeout(() => this.generateTone(659, 0.2, "sine"), 300);
        break;
      case "success_complete":
        this.generateTone(523, 0.12, "sine");
        setTimeout(() => this.generateTone(659, 0.12, "sine"), 120);
        setTimeout(() => this.generateTone(784, 0.12, "sine"), 240);
        setTimeout(() => this.generateTone(1047, 0.3, "sine"), 360);
        break;
      case "mission_start":
        this.generateTone(440, 0.1, "triangle");
        setTimeout(() => this.generateTone(587, 0.15, "triangle"), 100);
        break;
      default:
        this.generateTone(600, 0.05, "sine");
    }
  }

  private async loadSound(name: SoundName): Promise<AudioBuffer | null> {
    // Check cache
    if (this.buffers.has(name)) return this.buffers.get(name)!;

    const path = this.soundPaths[name];
    if (!path) return null;

    try {
      const response = await fetch(path);
      if (!response.ok) return null;
      const arrayBuffer = await response.arrayBuffer();
      const ctx = this.getContext();
      const buffer = await ctx.decodeAudioData(arrayBuffer);
      this.buffers.set(name, buffer);
      return buffer;
    } catch {
      return null;
    }
  }

  private playBuffer(buffer: AudioBuffer) {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const source = ctx.createBufferSource();
      const gain = ctx.createGain();
      source.buffer = buffer;
      gain.gain.setValueAtTime(this.volume, ctx.currentTime);
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start(0);
    } catch (e) {
      // Silently fail
    }
  }

  /** Preload all sounds */
  async preload() {
    const promises = Object.keys(this.soundPaths).map(name =>
      this.loadSound(name as SoundName).catch(() => null)
    );
    await Promise.allSettled(promises);
  }
}

// Singleton instance
export const soundService = new SoundService();

// Convenience hook for components
export function useSound() {
  return soundService;
}
