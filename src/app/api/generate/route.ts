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
      // Create streaming response
      const encoder = new TextEncoder()

      const stream = new ReadableStream({
        async start(controller) {
          try {
            const completion = await openai.chat.completions.create({
              model: "gpt-3.5-turbo",
              messages: [
                {
                  role: "system",
                  content: "You are a helpful assistant. Respond in a friendly and informative manner.",
                },
                {
                  role: "user",
                  content: message,
                },
              ],
              stream: true,
              max_tokens: 1000,
              temperature: 0.7,
            })

            for await (const chunk of completion) {
              const content = chunk.choices[0]?.delta?.content || ""

              if (content) {
                const data = JSON.stringify({
                  choices: [
                    {
                      delta: {
                        content: content,
                      },
                    },
                  ],
                })

                controller.enqueue(encoder.encode(`data: ${data}\n\n`))
              }
            }

            controller.enqueue(encoder.encode("data: [DONE]\n\n"))
            controller.close()
          } catch (error) {
            console.error("OpenAI API error:", error)
            controller.error(error)
          }
        },
      })

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      })
    } else {
      // Non-streaming response (fallback)
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant. Respond in a friendly and informative manner.",
          },
          {
            role: "user",
            content: message,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      })

      const result = completion.choices[0]?.message?.content || "No response generated"

      return NextResponse.json({ result })
    }
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
  }
}
