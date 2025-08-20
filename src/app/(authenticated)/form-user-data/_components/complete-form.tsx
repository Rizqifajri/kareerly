// app/(authenticated)/form-user-data/_components/complete-form.tsx
"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Clipboard } from "lucide-react";

export type Reco = {
  title: string;
  reason: string;
  suggested_keywords: string[];
};

type CompleteFormProps = {
  recommendations?: Reco[];
  loading?: boolean;
  error?: string | null;
};

export default function CompleteForm({
  recommendations = [],
  loading = false,
  error = null,
}: CompleteFormProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const allKeywords = useMemo(() => {
    const list = recommendations.flatMap((r) => r.suggested_keywords || []);
    return Array.from(new Set(list.map((k) => k.trim()).filter(Boolean)));
  }, [recommendations]);

  const handleCopyItem = async (idx: number, keywords: string[]) => {
    const text = keywords.join(", ");
    try {
      await navigator.clipboard.writeText(text);
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

  if (loading) {
    return (
      <div className="p-4 text-sm">
        AI thinking…
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

      {recommendations.length === 0 ? (
        <p className="text-sm text-muted-foreground">Belum ada rekomendasi. Klik “Generate”.</p>
      ) : (
        <ul className="space-y-4">
          {recommendations.map((r, idx) => (
            <li key={`${r.title}-${idx}`} className="rounded-xl border bg-card p-4">
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
          ))}
        </ul>
      )}

      <p className="text-xs text-muted-foreground">
        Tips: pakai keywords di atas buat cari lowongan di job board internal/eksternal.
      </p>
    </div>
  );
}
