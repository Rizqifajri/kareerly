import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export const runtime = "nodejs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file)
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Max file size is 8MB" },
        { status: 400 }
      );
    }

    const ab = await file.arrayBuffer();
    const buf = Buffer.from(ab);
    const lowerName = file.name.toLowerCase();
    const mime = file.type || "";

    let text = "";
    if (mime.includes("pdf") || lowerName.endsWith(".pdf")) {
      const data = await pdfParse(buf);
      text = data.text || "";
    } else if (mime.includes("word") || lowerName.endsWith(".docx")) {
      const result = await mammoth.extractRawText({ buffer: buf });
      text = result.value || "";
    } else if (mime.startsWith("text/") || lowerName.endsWith(".txt")) {
      text = buf.toString("utf8");
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Use PDF, DOCX, or TXT." },
        { status: 400 }
      );
    }

    const cleaned = text.replace(/\r/g, "").trim();
    const clipped = cleaned.slice(0, 20000);

    const prompt = `
Anda adalah penasihat karier dan asisten pencocokan pekerjaan.
Analisis teks CV/resume dan ekstrak latar belakang (skills, tools, industri, pendidikan, sertifikasi, tingkat senioritas).
Jika ada informasi yang hilang, gunakan asumsi terbaik dan tetap berikan rekomendasi.
Selalu kembalikan tepat 5 peran pekerjaan.

Gunakan bahasa Indonesia. Kembalikan HANYA JSON dengan skema berikut:
{
  "jobs": [
    { "title": "string", "reason": "string", "suggested_keywords": ["string"] }
  ]
}

CV/Resume:
${clipped}
`;

    const resp = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content:
            "Anda adalah asisten pencocokan pekerjaan. Jawab hanya dalam bahasa Indonesia. Selalu kembalikan JSON valid yang mengikuti skema.",
        },
        { role: "user", content: prompt },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "job_recommendations",
          strict: false, // biar lebih fleksibel
          schema: {
            type: "object",
            required: ["jobs"],
            properties: {
              jobs: {
                type: "array",
                minItems: 3,
                maxItems: 7,
                items: {
                  type: "object",
                  required: ["title", "reason", "suggested_keywords"],
                  properties: {
                    title: { type: "string" },
                    reason: { type: "string" },
                    suggested_keywords: {
                      type: "array",
                      items: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      temperature: 0.25,
    });

    const jsonText = resp.output_text;
    if (!jsonText) {
      return NextResponse.json(
        { error: "Model tidak mengembalikan output." },
        { status: 500 }
      );
    }

    let payload;
    try {
      payload = JSON.parse(jsonText);
    } catch (err) {
      console.error("JSON parse failed:", err, jsonText);
      return NextResponse.json(
        { error: "Gagal parsing JSON dari AI." },
        { status: 500 }
      );
    }

    if (!payload.jobs || payload.jobs.length === 0) {
      return NextResponse.json(
        { error: "AI tidak menemukan rekomendasi pekerjaan dari CV ini." },
        { status: 500 }
      );
    }

    return NextResponse.json(payload);
  } catch (e: any) {
    console.error("cv-recommendations error:", e);
    return NextResponse.json(
      { error: e?.message || "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
