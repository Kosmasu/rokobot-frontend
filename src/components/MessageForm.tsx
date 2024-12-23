import { Button, TextArea } from '@apideck/components'
import React, { useState, ChangeEvent, useEffect } from 'react'
import { useMessages } from '@/utils/useMessages'
import { Icon } from '@iconify/react'
import { useKeyboard } from '@/context/KeyboardContext'

const MessageForm = () => {
  const [content, setContent] = useState('')
  const { addMessage, isLoadingAnswer } = useMessages()
  const { activeKey } = useKeyboard()

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (activeKey) {
      switch (activeKey) {
        case 'BACKSPACE':
        case 'BACK':
          setContent((prev) => prev.slice(0, -1))
          break
        case 'ENTER':
          handleSubmit()
          break
        case 'SPACE':
          setContent((prev) => prev + ' ')
          break
        case 'ESCAPE':
        case 'ESC':
          setContent('')
          break
        default:
          if (activeKey.length === 1) {
            setContent((prev) => prev + activeKey)
          }
      }
    }
  }, [activeKey])

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault()
    const messageContent = content.trim()
    if (!messageContent) return

    setContent('')

    try {
      await addMessage(messageContent)
    } catch (error) {
      console.error('Failed to send message:', error)
      setContent(messageContent)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`mt-4 ${isMobile ? 'pb-4' : ''}`}>
      <div className="relative border border-[#1E755C] bg-[#001a00]">
        <TextArea
          name="content"
          rows={isMobile ? 1 : 2}
          value={content}
          autoFocus
          className="w-full bg-transparent text-primary-light border-0 focus:ring-0 placeholder-[#1E755C]/50"
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit()
            }
          }}
        />
        <div className="absolute right-2 bottom-2">
          <Button
            className="p-1"
            style={{ backgroundColor: '#66DCB7' }}
            type="submit"
            size="small"
            disabled={isLoadingAnswer}
          >
            <Icon icon="entypo:arrow-up" color="#030E07" width="20" height="20" />
          </Button>
        </div>
      </div>
    </form>
  )
}

export default MessageForm
