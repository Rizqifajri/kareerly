// app/api/cv-recommendations/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";           // needs Buffer, fs, etc.
export const dynamic = "force-dynamic";    // avoid caching on dev/edge

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // limit 8MB (adjust as you like)
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "Max file size is 8MB" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buf = Buffer.from(arrayBuffer);

    const name = (file.name || "").toLowerCase();
    const mime = (file.type || "").toLowerCase();

    let text = "";

    const isPDF = mime.includes("pdf") || name.endsWith(".pdf");
    const isDOCX = mime.includes("wordprocessingml") || name.endsWith(".docx");
    const isTXT = mime.startsWith("text/") || name.endsWith(".txt");

    if (isPDF) {
      // ✅ dynamic import avoids Turbopack test fixture issues and keeps TS happy
      const { default: pdfParse } = await import("pdf-parse");
      const data = await pdfParse(buf);
      text = data?.text ?? "";
    } else if (isDOCX) {
      // mammoth has no bundled types → type as any
      const mammoth: any = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer: buf });
      text = result?.value ?? "";
    } else if (isTXT) {
      text = buf.toString("utf8");
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload PDF, DOCX, or TXT." },
        { status: 400 }
      );
    }

    const cleaned = (text || "").replace(/\r/g, "").trim();
    if (!cleaned) {
      return NextResponse.json(
        { error: "Could not read any text from the CV." },
        { status: 400 }
      );
    }

    // Cap input length to keep token usage sane
    const clipped = cleaned.slice(0, 20000);

    const prompt =
      `Here is the user's CV/resume text. Extract background (roles, skills, industries, seniority), then recommend 5 job roles that fit. ` +
      `Return ONLY JSON following the schema (jobs[].title, jobs[].reason, jobs[].suggested_keywords[]).\n\nCV:\n` +
      clipped;

    const resp = await openai.responses.create({
      model: "gpt-4o-mini", // or "gpt-4.1-mini"
      input: [
        {
          role: "system",
          content:
            "You are a job-matching assistant. Strictly return JSON that matches the schema. Keep reasons concise.",
        },
        { role: "user", content: prompt },
      ],
      // ✅ Structured output (JSON Schema) using Responses API
      text: {
        format: {
          type: "json_schema",
          name: "job_recommendations",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["jobs"],
            properties: {
              jobs: {
                type: "array",
                minItems: 3,
                maxItems: 7,
                items: {
                  type: "object",
                  additionalProperties: false,
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

    const jsonText = resp.output_text ?? "{}";
    const payload = JSON.parse(jsonText);
    return NextResponse.json(payload);
  } catch (e: any) {
    console.error("cv-recommendations error:", e);
    return NextResponse.json(
      { error: e?.message || "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
