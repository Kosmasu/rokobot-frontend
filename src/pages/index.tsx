import MessageForm from '@/components/MessageForm'
import MessagesList from '@/components/MessageList'
import { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { MessagesProvider } from '@/utils/useMessages'
import Layout from '../components/Layout'

const IndexPage: NextPage = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <MessagesProvider>
      <div className="fixed inset-0 flex flex-col">
        <Layout>
          <div className="flex flex-col h-full">
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-custom">
              <MessagesList />
            </div>
            {isMobile ? (
              <div className="fixed bottom-0 left-0 right-0 px-4">
                <MessageForm />
              </div>
            ) : (
              <div className="flex-shrink-0 sticky bottom-0">
                <MessageForm />
              </div>
            )}
          </div>
        </Layout>
      </div>
    </MessagesProvider>
  )
}

export default IndexPage
