"use client";

import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, LoaderCircle, X } from "lucide-react";
import { useMonitorUI } from "@/components/MonitorUIProvider";

type ScrapeResponse = {
  data?: { id: string };
  error?: string;
};

export function TrackModal() {
  const router = useRouter();
  const { trackOpen, closeTrack } = useMonitorUI();
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!trackOpen) return;
    setUrl("");
    setError(null);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => window.clearTimeout(timer);
  }, [trackOpen]);

  useEffect(() => {
    if (!trackOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !loading) closeTrack();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [trackOpen, closeTrack, loading]);

  if (!trackOpen) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const payload = (await response.json()) as ScrapeResponse;

      if (!response.ok || !payload.data?.id) {
        setError(payload.error || "Gagal scrape konten.");
        return;
      }

      closeTrack();
      router.push(`/content/${payload.data.id}`);
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) closeTrack();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-lg rounded-t-xl border border-border bg-surface p-5 sm:rounded-xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-amber" aria-hidden />
            <h2 id={titleId} className="text-base font-semibold text-text">
              Track konten
            </h2>
          </div>
          <button
            type="button"
            onClick={closeTrack}
            disabled={loading}
            className="rounded-md p-1.5 text-muted hover:bg-bg hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber disabled:opacity-50"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label htmlFor="track-url" className="sr-only">
            URL konten
          </label>
          <input
            ref={inputRef}
            id="track-url"
            type="url"
            required
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://..."
            disabled={loading}
            className="w-full rounded-md border border-border bg-bg px-3 py-2.5 text-sm text-text placeholder:text-muted/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber disabled:opacity-60"
          />
          {error ? (
            <p
              role="alert"
              className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
            >
              {error}
            </p>
          ) : null}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={closeTrack}
              disabled={loading}
              className="rounded-md border border-border px-3 py-2 text-sm text-muted hover:bg-bg hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="inline-flex items-center gap-1.5 rounded-md bg-amber px-3 py-2 text-sm font-medium text-bg hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
              ) : null}
              {loading ? "Scraping..." : "Track"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
