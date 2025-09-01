import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { message, stream } = await req.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    if (stream) {
      const encoder = new TextEncoder()

      const streamRes = new ReadableStream({
        async start(controller) {
          try {
            const completion = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "system",
                  content: `
You are Kareerly AI Assistant, a career advisor and job-matching helper.
Answer user questions in a friendly, professional, and practical way.
Keep answers clear, concise, and easy to understand.
Do not output JSON unless explicitly asked.
`,
                },
                { role: "user", content: message },
              ],
              stream: true,
              temperature: 0.7,
              max_tokens: 1000,
            })

            for await (const chunk of completion) {
              const content = chunk.choices[0]?.delta?.content || ""
              if (content) {
                const data = JSON.stringify({
                  choices: [{ delta: { content } }],
                })
                controller.enqueue(encoder.encode(`data: ${data}\n\n`))
              }
            }

            controller.enqueue(encoder.encode("data: [DONE]\n\n"))
            controller.close()
          } catch (err) {
            console.error("OpenAI API error:", err)
            controller.error(err)
          }
        },
      })

      return new Response(streamRes, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      })
    } else {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
You are Kareerly AI Assistant, a career advisor and job-matching helper.
Answer user questions in a friendly, professional, and practical way.
Keep answers clear, concise, and easy to understand.
Do not output JSON unless explicitly asked.
`,
          },
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      })

      const result = completion.choices[0]?.message?.content || "No response generated"
      return NextResponse.json({ result })
    }
  } catch (err) {
    console.error("API error:", err)
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
  }
}
