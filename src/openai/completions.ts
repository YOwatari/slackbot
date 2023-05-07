interface request {
  model: string
  messages: [
    {
      role: string
      content: string
    },
  ]
  temperature?: number
  top_p?: number
  presence_penalty?: number
}

interface response {
  choices: [
    {
      index: number
      message: {
        role: string
        content: string
      }
    },
  ]
}

export async function completions(key: string, prompt: string) {
  const url = `https://api.openai.com/v1/chat/completions`
  const request: request = {
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.8,
    top_p: 1.0,
    presence_penalty: 1.0,
  }
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(request),
  })
  const result: response = await response.json()
  return result.choices[0].message.content.trim()
}
