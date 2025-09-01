import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { skills, industries, experience_level, education, certifications } = body

    if (!skills?.length && !industries?.length) {
      return NextResponse.json({ error: "At least provide skills or industries" }, { status: 400 })
    }

    const prompt = `
You are an expert career advisor. Based on the provided structured user data,
recommend 5 job roles that best fit. Keep reasons short and relevant.

User Data:
- Skills: ${skills?.join(", ") || "N/A"}
- Industries: ${industries?.join(", ") || "N/A"}
- Experience Level: ${experience_level || "N/A"}
- Education: ${education || "N/A"}
- Certifications: ${certifications?.join(", ") || "N/A"}

Return ONLY JSON in this format:
{
  "jobs": [
    { "title": "string", "reason": "string", "suggested_keywords": ["string"] }
  ]
}
`

    const resp = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content: "You are a job-matching assistant. Strictly return JSON only.",
        },
        { role: "user", content: prompt },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "job_recommendations",
          strict: false,
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
      temperature: 0.3,
    })

    const jsonText = resp.output_text
    if (!jsonText) {
      return NextResponse.json({ error: "Model tidak mengembalikan output." }, { status: 500 })
    }

    const payload = JSON.parse(jsonText)
    return NextResponse.json(payload)
  } catch (e: any) {
    console.error("recommendations error:", e)
    return NextResponse.json({ error: e?.message || "Failed to generate recommendations" }, { status: 500 })
  }
}
