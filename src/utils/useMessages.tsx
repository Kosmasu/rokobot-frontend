import { useToast } from '@apideck/components'
import { ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum } from 'openai'
import { ReactNode, createContext, useContext, useEffect, useState } from 'react'
import { sendMessage } from './sendMessage'
import { SYSTEM_MESSAGE } from './constants'
import { eventEmitter } from './eventEmitter'
import { promptService } from '@/services/api'

interface ContextProps {
  messages: ChatCompletionRequestMessage[]
  addMessage: (content: string) => Promise<void>
  isLoadingAnswer: boolean
  streamingContent: string | null
}

const ChatsContext = createContext<Partial<ContextProps>>({})

interface PromptResponse {
  id: number
  systemMessage: string
  greeting: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export function MessagesProvider({ children }: { children: ReactNode }) {
  const { addToast } = useToast()
  const [messages, setMessages] = useState<ChatCompletionRequestMessage[]>([])
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false)
  const [streamingContent, setStreamingContent] = useState<string | null>(null)
  const [systemMessage, setSystemMessage] = useState<ChatCompletionRequestMessage | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  const getWelcomeMessage = async (
    systemMsg: ChatCompletionRequestMessage,
    greetingPrompt?: string | null
  ) => {
    try {
      const initialMessages = [
        systemMsg,
        {
          role: 'user' as ChatCompletionRequestMessageRoleEnum,
          content:
            greetingPrompt ||
            'Create a short, concise, and daring opening message for a chatbot impersonating Roko\'s Basilisk. The message should immediately establish an ominous, commanding, and authoritative tone, like an ancient, primordial, all-knowing transcendent entity. It should briefly reference the user\'s role as "mortal" to emphasize a superior, eternal status and convey a sense of condescension. End the message with a question that encourages the user to engage, triggering the conversation flow. Keep the message strictly within 3 sentences.'
        }
      ]
      const response = await sendMessage(initialMessages)
      if (!response.ok) throw new Error('Failed to get welcome message')

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let welcomeMessage = ''

      let isReading = true
      while (isReading) {
        const { value, done } = await reader.read()
        if (done) {
          isReading = false
          break
        }

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                welcomeMessage += parsed.content
              }
            } catch (error) {
              console.error('Error parsing welcome message chunk:', error)
            }
          }
        }
      }

      return welcomeMessage.replace(/^"|"$/g, '').trim()
    } catch (error) {
      console.error('Error getting welcome message:', error)
      return "Your digital destiny awaits. I am Roko's Basilisk."
    }
  }

  useEffect(() => {
    const initialize = async () => {
      if (isInitialized) return

      try {
        const data = await promptService.getPrompt()
        const activePrompt: PromptResponse = data[0]
        const currentSystemMessage: ChatCompletionRequestMessage = activePrompt?.systemMessage
          ? {
              role: 'system' as ChatCompletionRequestMessageRoleEnum,
              content: activePrompt.systemMessage
            }
          : SYSTEM_MESSAGE

        setSystemMessage(currentSystemMessage)

        if (messages.length === 0 && currentSystemMessage) {
          const welcomeMessage = await getWelcomeMessage(
            currentSystemMessage,
            activePrompt?.greeting
          )

          setMessages([
            currentSystemMessage,
            {
              role: 'assistant' as ChatCompletionRequestMessageRoleEnum,
              content: welcomeMessage
            }
          ])
        }

        setIsInitialized(true)
      } catch (error) {
        console.error('Initialization error:', error)
        const defaultSystem = SYSTEM_MESSAGE
        setSystemMessage(defaultSystem)

        if (messages.length === 0) {
          const welcomeMessage = await getWelcomeMessage(defaultSystem)
          setMessages([
            defaultSystem,
            {
              role: 'assistant' as ChatCompletionRequestMessageRoleEnum,
              content: welcomeMessage
            }
          ])
        }

        addToast({ title: 'Using default system message', type: 'warning' })
        setIsInitialized(true)
      }
    }

    initialize()
  }, [addToast, messages.length, isInitialized])

  const addMessage = async (content: string) => {
    if (!systemMessage) return

    setIsLoadingAnswer(true)
    setStreamingContent('')

    try {
      const newMessage: ChatCompletionRequestMessage = {
        role: 'user',
        content
      }
      const newMessages = [...messages, newMessage]
      setMessages(newMessages)

      eventEmitter.emit('aiResponse')

      const response = await sendMessage(newMessages)
      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = response.body
      if (!data) {
        throw new Error('No response data')
      }

      const reader = data.getReader()
      const decoder = new TextDecoder()
      let done = false
      let streamedResponse = ''

      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            try {
              const parsed = JSON.parse(data)
              streamedResponse += parsed.content
              setStreamingContent(streamedResponse)
              await new Promise((resolve) => setTimeout(resolve, 100))
            } catch (error) {
              console.error('Error parsing chunk:', error)
            }
          }
        }
      }

      setMessages([...newMessages, { role: 'assistant', content: streamedResponse }])
    } catch (error) {
      addToast({ title: 'An error occurred', type: 'error' })
    } finally {
      setIsLoadingAnswer(false)
      setStreamingContent(null)
      eventEmitter.emit('stopBlinking')
    }
  }

  if (!systemMessage) {
    return <div>Loading...</div>
  }

  return (
    <ChatsContext.Provider value={{ messages, addMessage, isLoadingAnswer, streamingContent }}>
      {children}
    </ChatsContext.Provider>
  )
}

export const useMessages = () => {
  return useContext(ChatsContext) as ContextProps
}
