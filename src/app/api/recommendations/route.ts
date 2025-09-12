import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Received body:", body); // Debug log

    // Accept nested payload from stepper: { general, experience, skills }
    const {
      skills: skillsInput,
      industries: industriesInput,
      experience_level,
      education,
      certifications,
      general,
      experience,
    } = body || {};

    // Normalize skills
    const normalizedSkills: string[] = Array.isArray(skillsInput)
      ? skillsInput
      : [
          ...(Array.isArray(skillsInput?.soft_skill)
            ? skillsInput.soft_skill
            : []),
          ...(Array.isArray(skillsInput?.hard_skill)
            ? skillsInput.hard_skill
            : []),
          ...(Array.isArray(skillsInput?.languages)
            ? skillsInput.languages
            : []),
        ].filter(Boolean);

    // Normalize industries (fallback from general.major if industries not provided)
    const normalizedIndustries: string[] = Array.isArray(industriesInput)
      ? industriesInput
      : Array.isArray(general?.industries)
      ? general.industries
      : general?.major
      ? [general.major]
      : [];

    // Improved validation
    const hasSkills = normalizedSkills.length > 0;
    const hasIndustries = normalizedIndustries.length > 0;
    console.log("Skills:", normalizedSkills, "Has skills:", hasSkills); // Debug log
    console.log(
      "Industries:",
      normalizedIndustries,
      "Has industries:",
      hasIndustries
    ); // Debug log

    if (!hasSkills && !hasIndustries) {
      return NextResponse.json(
        {
          error: "At least provide skills or industries",
        },
        { status: 400 }
      );
    }

    const prompt = `
Anda adalah penasihat karier ahli. Berdasarkan data pengguna terstruktur yang diberikan,
rekomendasikan 5 peran pekerjaan yang paling cocok. Jelaskan alasan secara singkat dan relevan.
Gunakan bahasa Indonesia dalam seluruh respons.

User Data:
- Skills: ${hasSkills ? normalizedSkills.join(", ") : "N/A"}
- Industries: ${hasIndustries ? normalizedIndustries.join(", ") : "N/A"}
- Experience Level: ${
      experience_level || general?.preferred_work_setting || "N/A"
    }
- Education: ${education || general?.major || "N/A"}
- Certifications: ${
      Array.isArray(certifications) && certifications.length > 0
        ? certifications.join(", ")
        : "N/A"
    }

Kembalikan HANYA JSON dengan format berikut:
{
  "jobs": [
    { "title": "string", "reason": "string", "suggested_keywords": ["string"] }
  ]
}
`;

    // Fixed OpenAI API call
    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Anda adalah asisten pencocokan pekerjaan. Jawab hanya dalam bahasa Indonesia. Kembalikan hanya JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_object",
      },
      temperature: 0.3,
    });

    const jsonText = resp.choices[0].message.content;
    console.log("OpenAI response:", jsonText); // Debug log

    if (!jsonText) {
      return NextResponse.json(
        {
          error: "Model tidak mengembalikan output.",
        },
        { status: 500 }
      );
    }

    const payload = JSON.parse(jsonText);

    // Validate response structure
    if (!payload.jobs || !Array.isArray(payload.jobs)) {
      return NextResponse.json(
        {
          error: "Invalid response format from AI model",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(payload);
  } catch (e: any) {
    console.error("Recommendations error:", e);

    // More detailed error handling
    if (e.name === "SyntaxError") {
      return NextResponse.json(
        {
          error: "Failed to parse AI response",
        },
        { status: 500 }
      );
    }

    if (e.code === "invalid_api_key") {
      return NextResponse.json(
        {
          error: "Invalid OpenAI API key",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: e?.message || "Failed to generate recommendations",
      },
      { status: 500 }
    );
  }
}
