/** Global simulation clock — drives sky state updates. */
export class SimulationClock {
  private epochMs: number;
  private speed: number;
  private paused: boolean;

  constructor(epochMs = Date.now(), speed = 1, paused = false) {
    this.epochMs = epochMs;
    this.speed = speed;
    this.paused = paused;
  }

  getDate(): Date {
    return new Date(this.epochMs);
  }

  getSpeed(): number {
    return this.speed;
  }

  isPaused(): boolean {
    return this.paused;
  }

  tick(realDt: number) {
    if (this.paused || this.speed === 0) return;
    this.epochMs += realDt * 1000 * this.speed;
  }

  setSpeed(speed: number) {
    this.speed = Math.max(0, speed);
  }

  setPaused(paused: boolean) {
    this.paused = paused;
  }

  sync(state: { epochMs: number; speed: number; paused: boolean }) {
    this.epochMs = state.epochMs;
    this.speed = state.speed;
    this.paused = state.paused;
  }

  advanceMs(ms: number) {
    this.epochMs += ms;
  }
}

export const simulationClock = new SimulationClock();

export const TIME_SPEED_PRESETS = [
  { label: "1×", value: 1 },
  { label: "1h/s", value: 3600 },
  { label: "1d/s", value: 86_400 },
] as const;
