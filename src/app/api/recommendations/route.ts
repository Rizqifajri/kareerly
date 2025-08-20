// app/api/recommendations/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  const ct = req.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    return NextResponse.json(
      { error: 'Send JSON with header: Content-Type: application/json' },
      { status: 415 }
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server misconfigured: OPENAI_API_KEY missing" },
      { status: 500 }
    );
  }
  const openai = new OpenAI({ apiKey });

  try {
    const body = await req.json();
    const profile = {
      general: body?.general ?? {},
      experience: body?.experience ?? {},
      skills: body?.skills ?? {},
    };

    const resp = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        { role: "system", content: "You are a job-matching assistant. Return ONLY JSON matching the schema." },
        { role: "user", content: "Profile:\n" + JSON.stringify(profile) },
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
                    suggested_keywords: { type: "array", items: { type: "string" } },
                  },
                },
              },
            },
          },
        },
      },
      temperature: 0.3,
    });

    const jsonText = resp.output_text ?? "{}";
    return NextResponse.json(JSON.parse(jsonText));
  } catch (e: any) {
    console.error("recommendations error:", e);
    return NextResponse.json({ error: e?.message || "Failed to generate recommendations" }, { status: 500 });
  }
}
