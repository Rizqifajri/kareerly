// app/resume/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CompleteForm, { type Reco } from "@/app/(authenticated)/form-user-data/_components/complete-form";
import CVResult from "./_components/cv-result";

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Reco[]>([]);

  const onSubmit = async () => {
    if (!file) {
      setError("Pilih file CV terlebih dahulu.");
      return;
    }

    setLoading(true);
    setError(null);
    setRecommendations([]);

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/cv-recommendations", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) {
        console.error("CV API Error:", data);
        throw new Error(data?.error || "Gagal memproses CV");
      }

      setRecommendations(data.jobs ?? []);
    } catch (e: any) {
      setError(e?.message || "Gagal memproses CV");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold">Upload CV</h1>
        <p className="text-sm text-muted-foreground">
          Unggah berkas PDF, DOCX, atau TXT. Kami akan membaca pengalaman & skill kamu lalu
          menampilkan rekomendasi pekerjaan seperti di Final step.
        </p>

        <div className="flex items-center gap-3">
          <Input
            type="file"
            accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <Button onClick={onSubmit} disabled={!file || loading}>
            {loading ? "Memproses…" : "Generate"}
          </Button>
        </div>

        {file && <p className="text-xs text-muted-foreground">File: {file.name}</p>}
      </div>

      <CVResult recommendations={recommendations} loading={loading} error={error} />
    </div>
  );
}
