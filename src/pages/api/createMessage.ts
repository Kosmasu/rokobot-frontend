import { NextApiRequest, NextApiResponse } from 'next'

export default async function createMessage(req: NextApiRequest, res: NextApiResponse) {
  const { messages } = req.body
  const apiKey = process.env.NEXT_PUBLIC_LLAMA_API_KEY
  const url = 'https://api.llama-api.com/chat/completions'

  const conversationHistory = messages
  const body = JSON.stringify({
    messages: conversationHistory,
    model: 'llama3.1-405b',
    stream: true
  })

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI error:', response.status, errorText)
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    if (!response.body) {
      throw new Error('Response body is null')
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive'
    })

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    let streaming = true
    while (streaming) {
      const { done, value } = await reader.read()
      if (done) {
        streaming = false
        break
      }

      const chunk = decoder.decode(value)

      const lines = chunk.split('\n')
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') {
            res.end()
            return
          }

          try {
            const parsed = JSON.parse(data)

            // Handles Llama finished generating
            // Example: data: {"choices": [{"delta": {}, "finish_reason": "length", "index": 129}]}
            const finishReason = parsed.choices?.[0]?.finish_reason
            if (finishReason && finishReason !== null) {
              res.end()
              return
            }

            const content = parsed.choices[0]?.delta?.content || ''
            res.write(`data: ${JSON.stringify({ content })}\n\n`)
          } catch (error) {
            console.error('Error parsing chunk:', error)
          }
        }
      }
    }
  } catch (error: unknown) {
    console.error('Error in createMessage:', error)
    if (error instanceof Error) {
      res.status(500).json({ error: error.message })
    } else {
      res.status(500).json({ error: 'An unknown error occurred' })
    }
  }
}
