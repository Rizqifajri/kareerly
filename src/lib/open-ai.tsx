export async function generateOpenAI(userInput: string, onChunk?: (chunk: string) => void): Promise<string> {
  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: userInput, stream: true }),
    })

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    const reader = res.body?.getReader()
    const decoder = new TextDecoder()
    let fullResponse = ""

    if (!reader) {
      throw new Error("No reader available")
    }

    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split("\n")

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6)

          if (data === "[DONE]") {
            return fullResponse
          }

          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices?.[0]?.delta?.content || ""

            if (content) {
              fullResponse += content
              onChunk?.(content)
            }
          } catch {
            // Skip invalid JSON lines
            continue
          }
        }
      }
    }

    return fullResponse || "Error: No response from OpenAI"
  } catch (error) {
    console.error("Fetch error:", error)
    return "Maaf, terjadi kesalahan saat menghubungi OpenAI."
  }
}
