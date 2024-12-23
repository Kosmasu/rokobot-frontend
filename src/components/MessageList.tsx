import { useMessages } from '@/utils/useMessages'
import { useEffect, useRef, useState } from 'react'

const MessagesList = () => {
  const { messages, isLoadingAnswer, streamingContent } = useMessages()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const scrollToBottom = () => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  useEffect(() => {
    scrollToBottom()
    if (streamingContent) {
      audioRef.current?.play()
    }
  }, [streamingContent])

  return (
    <div
      className={`flex-1 font-mono ${
        isMobile ? 'h-[calc(100vh-230px)]' : 'h-[calc(100vh-430px)]'
      } overflow-y-auto scrollbar-custom`}
    >
      <audio ref={audioRef} src="/sounds/keyboard-output.mp3" />
      {messages?.map((message, i: number) => {
        const isUser = message.role === 'user'
        if (message.role === 'system') return null
        return (
          <div
            id={`message-${i}`}
            className={`mb-4 fade-up flex ${isUser ? 'justify-end' : 'justify-start'}`}
            key={`${i}-${message.content}`}
          >
            <div
              className={`flex items-center gap-2 p-2 max-w-[80%] rounded ${
                isUser
                  ? isMobile
                    ? 'bg-[#030E07] text-primary-bright border-primary-bright border' // Mobile user message style
                    : 'border border-[#00FF9F] text-[#00FF9F]' // Desktop user message style
                  : 'bg-[#00FF9F]' // Assistant message style
              }`}
            >
              <div className="flex-1">{message.content?.trim() || ''}</div>
            </div>
          </div>
        )
      })}

      {streamingContent && (
        <div className="mb-4 flex justify-start">
          <div className="flex items-center gap-2 p-2 max-w-[80%] bg-[#00FF9F] rounded">
            <div>{streamingContent}</div>
          </div>
        </div>
      )}

      {isLoadingAnswer && !streamingContent && (
        <div className="flex gap-2 mb-4">
          <div className="flex gap-2">
            <span className="block w-2 h-4 bg-[#00ff00] animate-pulse"></span>
            <span className="block w-2 h-4 bg-[#00ff00] animate-pulse delay-75"></span>
            <span className="block w-2 h-4 bg-[#00ff00] animate-pulse delay-150"></span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  )
}

export default MessagesList
