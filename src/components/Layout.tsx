import Head from 'next/head'
import React, { ReactNode, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlobeComponent from './GlobeComponent'
import CpuUsageChart from './CpuUsageChart'
import SystemLoadChart from './SystemLoadChart'
import SnakeModel from './MovingSnake'
import VirtualKeyboard from './VirtualKeyboard'
import AudioFolder from './AudioFolder'
import Clock from './Clock'
import { Icon } from '@iconify/react'

type Props = {
  children: ReactNode
  title?: string
  description?: string
  favicon?: string
}

const Layout = ({
  children,
  title = 'Rokobot',
  description = 'AI chat bot for Rocos basilik impersonate',
  favicon = '/img/ai-robot.jpg'
}: Props) => {
  const [showKeyboard, setShowKeyboard] = useState(false)
  const [showTerminal, setShowTerminal] = useState(false)
  const [showMessages, setShowMessages] = useState(false)
  const [showClock, setShowClock] = useState(false)
  const [showUptime, setShowUptime] = useState(false)
  const [showCpuUsage, setShowCpuUsage] = useState(false)
  const [showWorldView, setShowWorldView] = useState(false)
  const [showAudioFolder, setShowAudioFolder] = useState(false)

  const [isMobile, setIsMobile] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const [isPlaying, setIsPlaying] = useState(false)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)

  const [isCopied, setIsCopied] = useState(false)

  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    // Show messages after small delay
    setTimeout(() => setShowMessages(true), 1000)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const sequence = async () => {
      setTimeout(() => setShowKeyboard(true), 500)
      setTimeout(() => {
        setShowTerminal(true)
        setShowMessages(true)
      }, 1000)
      setTimeout(() => setShowClock(true), 1500)
      setTimeout(() => setShowUptime(true), 1800)
      setTimeout(() => setShowCpuUsage(true), 2100)
      setTimeout(() => setShowWorldView(true), 5000)
      setTimeout(() => setShowAudioFolder(true), 2800)
    }

    sequence()
  }, [])

  useEffect(() => {
    // Play background music with debug logs
    if (audioRef.current) {
      console.log('Audio element found')
      audioRef.current.volume = 0.3

      // Remove automatic play attempt on load
      // Just add event listeners for debugging
      const audio = audioRef.current
      audio.addEventListener('error', (e) => {
        console.log('Audio error:', e)
      })

      audio.addEventListener('loadeddata', () => {
        console.log('Audio data loaded')
      })

      audio.addEventListener('canplay', () => {
        console.log('Audio can play')
      })
    } else {
      console.log('Audio element not found')
    }
  }, [])

  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!hasUserInteracted && audioRef.current) {
        setHasUserInteracted(true)
        setIsPlaying(true)
        audioRef.current
          .play()
          .then(() => {
            console.log('Audio playing after user interaction')
          })
          .catch((error) => {
            console.log('Audio play failed:', error)
            setIsPlaying(false)
          })
      }
    }

    // Add click listener to entire document
    document.addEventListener('click', handleFirstInteraction, { once: true })

    return () => {
      document.removeEventListener('click', handleFirstInteraction)
    }
  }, [hasUserInteracted])

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current
          .play()
          .then(() => {
            console.log('Audio playing successfully')
            setIsPlaying(true)
          })
          .catch((error) => {
            console.log('Audio play failed:', error)
            setIsPlaying(false)
          })
      }
    }
  }

  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText('Coming Soon')
      setIsCopied(true)

      // Reset status setelah 2 detik
      setTimeout(() => {
        setIsCopied(false)
      }, 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  if (isMobile) {
    return (
      <div className="h-screen flex flex-col bg-[#030E07]">
        <Head>
          <title>{title}</title>
          <meta name="description" content={description} />
          <meta charSet="utf-8" />
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width, viewport-fit=cover, maximum-scale=1.0, user-scalable=no"
          />
          <link rel="icon" href={favicon} />
        </Head>

        <div className="relative h-full w-full">
          <div className="relative terminal-panel flex justify-between gap-0 px-2 pt-4 w-full text-xs text-cap bg-transparent z-[20]">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="bg-[#030E07] text-primary-bright rounded-md p-1 border border-primary-bright"
            >
              <Icon icon="ci:hamburger-md" width="28" height="28" />
            </button>
            <button className="bg-[#030E07] text-xl text-primary-bright rounded-md px-6 border border-primary-bright font-pixelify tracking-widest">
              JOIN
            </button>
            <button className="bg-[#030E07] text-primary-bright rounded-md p-1 border border-primary-bright">
              <Icon icon="solar:copy-outline" width="28" height="28" />
            </button>
          </div>
          {/* Sidebar */}
          <AnimatePresence>
            {isSidebarOpen && (
              <>
                {/* Overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsSidebarOpen(false)}
                  className="fixed inset-0 bg-black z-30"
                />

                {/* Sidebar */}
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'tween' }}
                  className="fixed left-0 top-0 h-full w-64 bg-[#030E07] border-r border-[#1E755C] z-40"
                >
                  <div className="p-4">
                    <div className="flex justify-end">
                      <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="text-primary-light"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="space-y-4 mt-8">
                      <button className="w-full bg-primary-light text-black py-2 px-4 rounded hover:opacity-80 transition-opacity">
                        Roko
                      </button>
                      <button className="w-full border border-[#1E755C] text-primary-light py-2 px-4 rounded hover:bg-[#1E755C] hover:text-black transition-colors">
                        Twitter
                      </button>
                      <button className="w-full border border-[#1E755C] text-primary-light py-2 px-4 rounded hover:bg-[#1E755C] hover:text-black transition-colors">
                        Tiktok
                      </button>
                      <button className="w-full border border-[#1E755C] text-primary-light py-2 px-4 rounded hover:bg-[#1E755C] hover:text-black transition-colors">
                        Telegram
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <div className="absolute inset-0 z-0">
            <SnakeModel isMobile={true} />
          </div>

          {/* Chat Content */}
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex-1 p-4 overflow-y-auto">{children}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-[#030E07]">
      <audio ref={audioRef} loop>
        <source src="/sounds/rk-bgm.mp3" type="audio/mpeg" />
      </audio>

      <Head>
        <title>{title}</title>
        <meta name="description" content={description}></meta>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link rel="icon" href={favicon} />
      </Head>

      <div className="h-[40px] font-united tracking-[.15em] border-b border-[#1E755C] p-2 text-[#1E755C] flex justify-between items-center">
        <div>SYSTEM</div>
        <button
          onClick={handleCopyClick}
          className="font-bold text-[#2A9D7C] hover:text-[#37E8FC] transition-colors duration-200"
        >
          CA : {isCopied ? 'Copied' : 'Coming Soon'}
        </button>
        <div className="flex items-center gap-2">
          <div>MESSAGES</div>
        </div>
      </div>

      <div className="font-united tracking-[.15em] h-[calc(100vh-300px)] flex flex-nowrap">
        <AnimatePresence>
          {/* Left sidebar */}
          <motion.div
            className="system-container min-w-[270px] w-[17%] border-r border-[#1E755C] p-4 text-[#1E755C] h-[calc(100vh-300px)] overflow-hidden"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {showClock && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 1.5 }}
              >
                <Clock />
              </motion.div>
            )}

            <div className="space-y-2 mb-2">
              {showUptime && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 1.8 }}
                  className="border-b border-t border-[#1E755C] py-2 text-primary-light"
                >
                  UPTIME: 1:08:51
                </motion.div>
              )}

              {showCpuUsage && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 2.1 }}
                >
                  <div className="font-bold border-b border-[#1e755c7b] mb-2 text-primary-light">
                    CPU USAGE:
                  </div>
                  <div className="flex cpu-usage h-[35px] border-b border-[#1e755c7b]">
                    <div className="flex flex-col items-left w-[80px] tracking-normal">
                      <div className="text-sm font-bold text-primary-light">*1-2</div>
                      <div className="text-[9px]">avg 56%</div>
                    </div>
                    <div className="mb-2">
                      <CpuUsageChart />
                    </div>
                  </div>
                  <div className="flex cpu-usage h-[35px] pt-2">
                    <div className="flex flex-col items-left w-[80px] tracking-normal">
                      <div className="text-sm font-bold text-primary-light">*1-2</div>
                      <div className="text-[9px]">avg 56%</div>
                    </div>
                    <div>
                      <SystemLoadChart />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {showWorldView && (
              <div className="flex flex-col h-[calc(100vh-540px)]">
                <div className="font-bold border-t border-[#1E755C] pt-2 text-primary-light">
                  WORLD VIEW:
                </div>
                <GlobeComponent />
              </div>
            )}
          </motion.div>

          {/* Terminal */}
          {showTerminal && (
            <div className="terminal-container w-[300px] max-h-[calc(100vh-300px)] flex-grow flex flex-col border-r border-[#1E755C] text-[#1E755C]">
              <div className="terminal-panel flex items-center gap-0 p-0 w-full text-xs text-cap">
                <button className="flex-1 bg-primary-light text-black py-1 px-3 hover:opacity-80 transition-opacity [clip-path:polygon(0_0,97%_0,100%_100%,0%_100%)]">
                  <span>Roko Basilisk</span>
                </button>
                <button className="flex-1 border-y border-r border-[#1E755C] py-1 px-3 hover:text-[#00FF9F] transition-colors transform skew-x-[20deg]">
                  <span className="inline-block transform skew-x-[-20deg]">Twitter</span>
                </button>
                <button className="flex-1 border-y border-r border-[#1E755C] py-1 px-3 hover:text-[#00FF9F] transition-colors transform skew-x-[20deg]">
                  <span className="inline-block transform skew-x-[-20deg]">Tiktok</span>
                </button>
                <button className="flex-1 border-y border-r border-[#1E755C] py-1 px-3 hover:text-[#00FF9F] transition-colors [clip-path:polygon(0_0,100%_0,98.5%_100%,0_100%)]">
                  <span>Telegram</span>
                </button>
              </div>
              <SnakeModel />
            </div>
          )}
          {/* Messages */}
          {showMessages && (
            <motion.div
              className="font-united tracking-tight messages-container min-w-[250px] max-w-[30%] flex flex-col"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              <div className="bg-primary-light py-[0.2px] px-2 text-gray-800 text-center capitalize">
                Main Shell
              </div>
              <div className="h-full p-4 overflow-y-auto">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Keyboard Section */}
      <div className="border-t font-united tracking-wider border-[#1E755C] pt-0 text-[#1E755C] text-sm">
        <div className="flex justify-between items-start h-full gap-4">
          {/* Audio Folder Container - tanpa animasi karena sudah dihandle di komponennya */}
          <div className="flex-1 overflow-y-auto scrollbar-custom">
            {showAudioFolder && (
              <div className="w-full h-[260px] overflow-y-auto scrollbar-custom">
                <AudioFolder isPlaying={isPlaying} onToggleAudio={toggleAudio} />
              </div>
            )}
          </div>
          {/* Virtual Keyboard Container */}
          <div className="flex-1 h-full py-2 text-center">
            <AnimatePresence>
              {showKeyboard && (
                <motion.div
                  className="w-full"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 20,
                    duration: 0.5
                  }}
                >
                  <VirtualKeyboard />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Layout
