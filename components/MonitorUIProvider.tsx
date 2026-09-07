"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type MonitorUIContextValue = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  trackOpen: boolean;
  openTrack: () => void;
  closeTrack: () => void;
};

const MonitorUIContext = createContext<MonitorUIContextValue | null>(null);

export function MonitorUIProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [trackOpen, setTrackOpen] = useState(false);

  const openTrack = useCallback(() => setTrackOpen(true), []);
  const closeTrack = useCallback(() => setTrackOpen(false), []);

  const value = useMemo(
    () => ({
      searchQuery,
      setSearchQuery,
      trackOpen,
      openTrack,
      closeTrack,
    }),
    [searchQuery, trackOpen, openTrack, closeTrack]
  );

  return (
    <MonitorUIContext.Provider value={value}>{children}</MonitorUIContext.Provider>
  );
}

export function useMonitorUI() {
  const ctx = useContext(MonitorUIContext);
  if (!ctx) {
    throw new Error("useMonitorUI must be used within MonitorUIProvider");
  }
  return ctx;
}
