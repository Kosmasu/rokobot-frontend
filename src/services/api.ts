const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.NEXT_PUBLIC_API_KEY

interface Prompt {
  systemMessage: string
  greeting?: string | null
  isActive: boolean
}

interface StoryPrompt {
  name: string
  description: string
  systemMessage: string
  userPrompt: string
  isActive: boolean
}

export const tweetService = {
  async getTweets() {
    const response = await fetch(`${API_BASE_URL}/tweets`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`
      }
    })

    console.log('response', response)

    if (!response.ok) {
      throw new Error('Failed to fetch tweets')
    }

    return await response.json()
  }
}

export const promptService = {
  async getPrompt() {
    const response = await fetch(`${API_BASE_URL}/prompts`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch prompt')
    }

    return await response.json()
  },

  async updatePrompt(prompt: Prompt) {
    const response = await fetch(`${API_BASE_URL}/prompts/1`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`
      },
      body: JSON.stringify(prompt)
    })

    if (!response.ok) {
      throw new Error('Failed to update prompt')
    }

    return await response.json()
  }
}

export const storyPromptService = {
  async getStoryPrompts() {
    const response = await fetch(`${API_BASE_URL}/story-prompts`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch story prompts')
    }

    return await response.json()
  },

  async updateStoryPrompt(id: number, prompt: StoryPrompt) {
    const response = await fetch(`${API_BASE_URL}/story-prompts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`
      },
      body: JSON.stringify(prompt)
    })

    if (!response.ok) {
      throw new Error('Failed to update story prompt')
    }

    return await response.json()
  },

  async createStoryPrompt(prompt: StoryPrompt) {
    const response = await fetch(`${API_BASE_URL}/story-prompts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`
      },
      body: JSON.stringify(prompt)
    })

    if (!response.ok) {
      throw new Error('Failed to create story prompt')
    }

    return await response.json()
  },

  async deleteStoryPrompt(id: number) {
    const response = await fetch(`${API_BASE_URL}/story-prompts/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to delete story prompt')
    }

    return await response.json()
  }
}
