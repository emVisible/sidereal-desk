import { useEffect, useRef, useState } from "react";
import { computeSkyState, type SkyState } from "../astronomy/skyState";
import { simulationClock } from "../core/SimulationClock";
import { useAppStore } from "../store/useAppStore";

/** Drives sky updates: rAF tick + cached slow ephemeris. */
export function useSkyLoop() {
  const location = useAppStore((s) => s.location);
  const [sky, setSky] = useState<SkyState>(() =>
    computeSkyState(location, simulationClock.getDate()),
  );
  const locationRef = useRef(location);
  locationRef.current = location;

  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      simulationClock.tick(dt);
      const date = simulationClock.getDate();
      setSky(computeSkyState(locationRef.current, date));
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return sky;
}
