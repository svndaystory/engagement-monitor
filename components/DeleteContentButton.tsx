"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoaderCircle, Trash2 } from "lucide-react";

type Props = {
  contentId: string;
  label: string;
};

export function DeleteContentButton({ contentId, label }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = window.confirm(`Hapus konten?\n\n${label}`);
    if (!confirmed) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/content?id=${encodeURIComponent(contentId)}`,
        { method: "DELETE" }
      );
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setError(payload?.error || "Gagal menghapus.");
        return;
      }

      router.push("/content");
      router.refresh();
    } catch {
      setError("Gagal menghapus.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-muted hover:border-danger/40 hover:bg-danger/10 hover:text-danger focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber disabled:opacity-50"
        aria-label="Hapus konten"
      >
        {loading ? (
          <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden />
        ) : (
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
        )}
        Hapus
      </button>
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
