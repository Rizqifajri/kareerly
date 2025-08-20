// app/api/cv-recommendations/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export const runtime = "nodejs"; // butuh Node APIs (Buffer)

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
    const clipped = cleaned.slice(0, 20000); // batasi panjang input

    const prompt =
      `Here is the user's CV/resume text. Extract background (roles, skills, industries, seniority), then recommend 5 job roles that fit. ` +
      `Return ONLY JSON following the schema (jobs[].title, jobs[].reason, jobs[].suggested_keywords[]).\n\nCV:\n` +
      clipped;

    const resp = await openai.responses.create({
      model: "gpt-4o-mini", // atau "gpt-4.1-mini"
      input: [
        {
          role: "system",
          content:
            "You are a job-matching assistant. Strictly return JSON that matches the schema. Keep reasons concise.",
        },
        { role: "user", content: prompt },
      ],
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
