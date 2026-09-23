import { createContext, useContext, useEffect, useMemo, useState } from "react";
import defaultProgress from "../data/defaultProgress.json";

const STORAGE_KEY = "vaqelra.progress.v1";
const LEGACY_STORAGE_KEY = "linguasphere.progress.v1";

const AppContext = createContext(null);

function loadInitial() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY) || window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn("Could not read saved progress, using defaults.", err);
  }
  return defaultProgress;
}

export function AppProvider({ children }) {
  const [progress, setProgress] = useState(loadInitial);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (err) {
      console.warn("Could not save progress.", err);
    }
  }, [progress]);

  function recordSession({ scenarioId, world, scores, mistakes, corrections = [] }) {
    setProgress((prev) => {
      const earnedXp = Math.round(
        (scores.grammar + scores.vocabulary + scores.pronunciation + scores.fluency) / 4 * 0.6
      );
      let xp = prev.xp + earnedXp;
      let level = prev.level;
      let xpToNextLevel = prev.xpToNextLevel;
      while (xp >= xpToNextLevel) {
        xp -= xpToNextLevel;
        level += 1;
        xpToNextLevel = Math.round(xpToNextLevel * 1.25);
      }
      const session = {
        scenarioId,
        world,
        date: new Date().toISOString().slice(0, 10),
        scores,
        mistakes,
        corrections,
      };
      return {
        ...prev,
        xp,
        level,
        xpToNextLevel,
        completedSessions: [session, ...prev.completedSessions].slice(0, 20),
      };
    });
    return true;
  }

  function resetProgress() {
    setProgress({ ...defaultProgress, completedSessions: [] });
  }

  const mistakeFrequency = useMemo(() => {
    const counts = {};
    progress.completedSessions.forEach((s) => {
      (s.mistakes || []).forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return counts;
  }, [progress.completedSessions]);

  const value = { progress, recordSession, resetProgress, mistakeFrequency };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
