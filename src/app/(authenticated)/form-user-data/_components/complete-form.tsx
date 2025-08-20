// app/(authenticated)/form-user-data/_components/complete-form.tsx
"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Clipboard, SparklesIcon } from "lucide-react";

export type Reco = {
  title: string;
  reason: string;
  suggested_keywords: string[];
};

type CompleteFormProps = {
  // ⬇️ dibiarkan ada untuk kompatibilitas, tapi kita TIDAK pakai
  recommendations?: Reco[];
  loading?: boolean;
  error?: string | null;
};

export default function CompleteForm(_: CompleteFormProps) {
  // Selalu mulai fresh (tidak baca rekomendasi dari props atau localStorage)
  const [recs, setRecs] = useState<Reco[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset total saat komponen mount (masuk step Final)
  useEffect(() => {
    setRecs([]);
    setError(null);
    setLoading(false);
    // kalau dulu pernah simpan di localStorage, pastikan dibersihkan:
    localStorage.removeItem("pb_recommendations");
  }, []);

  // Fade-in stagger
  const [animateIn, setAnimateIn] = useState(false);
  useEffect(() => {
    setAnimateIn(false);
    if (recs.length > 0) {
      const t = setTimeout(() => setAnimateIn(true), 30);
      return () => clearTimeout(t);
    }
  }, [recs]);

  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const allKeywords = useMemo(() => {
    const list = recs.flatMap((r) => r.suggested_keywords || []);
    return Array.from(new Set(list.map((k) => k.trim()).filter(Boolean)));
  }, [recs]);

  const handleCopyItem = async (idx: number, keywords: string[]) => {
    try {
      await navigator.clipboard.writeText((keywords || []).join(", "));
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    } catch {}
  };

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(allKeywords.join(", "));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1500);
    } catch {}
  };

  // ✅ hanya dipanggil saat klik Generate; selalu overwrite hasil lama
  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = localStorage.getItem("pb_user") || "{}";
      const { general = {}, experience = {}, skills = {} } = JSON.parse(raw);

      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ general, experience, skills }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to generate");

      // Overwrite (bukan append) supaya selalu ganti yang baru
      setRecs(Array.isArray(data.jobs) ? data.jobs : []);
    } catch (e: any) {
      setError(e?.message || "Failed to generate");
      setRecs([]); // pastikan kosong saat gagal
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-sm">
        AI lagi mikir rekomendasi…
        <div className="mt-3 h-2 w-40 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-sm text-red-600">Gagal generate: {error}</div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">Rekomendasi Pekerjaan</h3>
        <div className="flex items-center gap-2">
          <Button type="button" onClick={handleGenerate} className="cursor-pointer gap-2" aria-label="Generate">
            Generate <SparklesIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyAll}
            disabled={allKeywords.length === 0}
            className="gap-2"
            aria-label="Copy all keywords"
          >
            {copiedAll ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
            {copiedAll ? "Copied" : "Copy All Keywords"}
          </Button>
        </div>
      </div>

      {recs.length === 0 ? (
        <p className="text-sm text-muted-foreground">Belum ada rekomendasi. Klik “Generate”.</p>
      ) : (
        <ul className="space-y-4">
          {recs.map((r, idx) => {
            const delayMs = idx * 120; // stagger
            return (
              <li
                key={`${r.title}-${idx}`}
                className={[
                  "rounded-xl border bg-card p-4",
                  "transition-all duration-500 ease-out",
                  animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1",
                ].join(" ")}
                style={{ transitionDelay: `${delayMs}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{r.title}</div>
                    {r.reason && <div className="mt-1 text-sm text-muted-foreground">{r.reason}</div>}
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopyItem(idx, r.suggested_keywords ?? [])}
                    disabled={!r.suggested_keywords || r.suggested_keywords.length === 0}
                    className="gap-2"
                    aria-label="Copy item keywords"
                  >
                    {copiedIdx === idx ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Clipboard className="h-4 w-4" />
                        Copy Keywords
                      </>
                    )}
                  </Button>
                </div>

                {r.suggested_keywords?.length ? (
                  <>
                    <Separator className="my-3" />
                    <div className="flex flex-wrap gap-2">
                      {r.suggested_keywords.map((k, i) => (
                        <Badge key={`${k}-${i}`} variant="secondary">
                          {k}
                        </Badge>
                      ))}
                    </div>
                  </>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-xs text-muted-foreground">
        Tips: pakai keywords di atas buat cari lowongan di job board internal/eksternal.
      </p>
    </div>
  );
}
