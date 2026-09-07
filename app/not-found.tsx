import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded-lg border border-border bg-surface px-4 py-10 text-center">
      <h1 className="text-base font-semibold text-text">Tidak ditemukan</h1>
      <Link
        href="/content"
        className="mt-4 inline-block text-sm text-teal hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
      >
        Kembali
      </Link>
    </div>
  );
}
