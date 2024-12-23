import React, { useEffect, useState, useRef } from 'react'
import { tweetService } from '@/services/api'
import { Icon } from '@iconify/react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface Tweet {
  mediaUrl: string
  mediaId: string
  content: string
  caption: string
  type?: 'bgm-control' | 'test-folder'
}

type AudioFolderItem =
  | Tweet
  | TestFolder
  | SocialIcon
  | {
      type: 'bgm-control' | 'test-folder'
      mediaId: string
      mediaUrl: string
      caption: string
    }

interface AudioFolderProps {
  isPlaying: boolean
  onToggleAudio: () => void
}

// Update interface TestFolder untuk menambahkan mediaUrl
interface TestFolder {
  type: 'test-folder'
  mediaId: string
  caption: string
  mediaUrl?: string
  title: string
  content: string
  videoUrl: string
}

// Update TEST_FOLDERS untuk include semua video
const TEST_FOLDERS: TestFolder[] = [
  {
    type: 'test-folder',
    mediaId: 'test-folder',
    mediaUrl: '',
    title: 'Video Samples',
    content: 'Collection of sample videos',
    videoUrl: '/videos/sample1.mp4',
    caption: ''
  },
  {
    type: 'test-folder',
    mediaId: 'dragon-gif',
    mediaUrl: '/img/dragon.gif',
    title: 'Dragon Animation',
    content: 'Animated dragon gif',
    videoUrl: '', // tidak perlu videoUrl untuk gif
    caption: ''
  }
]

// Tambah interface untuk social icons
interface SocialIcon {
  type: 'social-icon'
  mediaId: string
  mediaUrl: string
  imagePath: string
  label: string
  link?: string
}

// Tambah array untuk social icons
const SOCIAL_ICONS: SocialIcon[] = [
  {
    type: 'social-icon',
    mediaId: 'twitter',
    mediaUrl: '',
    imagePath: '/img/twitter_roko.png',
    label: 'Twitter'
  },
  {
    type: 'social-icon',
    mediaId: 'dexscreener',
    mediaUrl: '',
    imagePath: '/img/dex_roko.png',
    label: 'Dexscreener'
  },
  {
    type: 'social-icon',
    mediaId: 'pumpfun',
    mediaUrl: '',
    imagePath: '/img/pf_roko.png',
    label: 'Pumpfun'
  },
  {
    type: 'social-icon',
    mediaId: 'ca-copy',
    mediaUrl: '',
    imagePath: '/img/ca_roko.png',
    label: 'CA'
  }
]

interface VideoMetadata {
  width: number
  height: number
}

const AudioFolder = ({ isPlaying, onToggleAudio }: AudioFolderProps) => {
  const [tweets, setTweets] = useState<AudioFolderItem[]>([])
  const [visibleTweets, setVisibleTweets] = useState<AudioFolderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)
  const folderSoundRef = useRef<HTMLAudioElement | null>(null)
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })
  const [activePopups, setActivePopups] = useState<string[]>([])
  const [showVideos, setShowVideos] = useState<string[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [videoMetadata, setVideoMetadata] = useState<Record<string, VideoMetadata>>({})

  useEffect(() => {
    folderSoundRef.current = new Audio('/sounds/folder.wav')
    folderSoundRef.current.volume = 0.5
  }, [])

  useEffect(() => {
    const fetchTweets = async () => {
      try {
        const data = await tweetService.getTweets()
        const audioTweets = data.filter((tweet: Tweet) => tweet.mediaUrl).slice(0, 20)

        // Update urutan: social icons, audio tweets, BGM control, lalu TEST_FOLDERS
        const tweetsWithExtras: AudioFolderItem[] = [
          ...SOCIAL_ICONS,
          ...(audioTweets as Tweet[]),
          { type: 'bgm-control', mediaId: 'bgm', mediaUrl: '/sounds/bgm.mp3' },
          ...TEST_FOLDERS
        ]

        setTweets(tweetsWithExtras)
        setVisibleTweets([])
      } catch (error) {
        setError('Failed to fetch tweets')
      } finally {
        setLoading(false)
      }
    }

    fetchTweets()
  }, [])

  useEffect(() => {
    if (tweets.length > 0 && visibleTweets.length < tweets.length) {
      const timer = setTimeout(() => {
        setVisibleTweets((prev) => [...prev, tweets[visibleTweets.length]])
      }, Math.random() * 100 + 50) // Random delay between 50-150ms

      return () => clearTimeout(timer)
    }
  }, [tweets, visibleTweets])

  const handleAudioClick = (mediaUrl: string) => {
    if (folderSoundRef.current) {
      const sound = folderSoundRef.current.cloneNode() as HTMLAudioElement
      sound.play().catch((e) => console.log('Audio play failed:', e))
    }

    if (playingAudio === mediaUrl) {
      audioElement?.pause()
      setPlayingAudio(null)
      setAudioElement(null)
    } else {
      audioElement?.pause()
      const audio = new Audio(mediaUrl)
      audio.play()
      audio.onended = () => {
        setPlayingAudio(null)
        setAudioElement(null)
      }
      setPlayingAudio(mediaUrl)
      setAudioElement(audio)
    }
  }

  const handleTestClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const popupWidth = 320
    const popupHeight = 300

    setPopupPosition({
      x: rect.left + rect.width / 2 - popupWidth / 2,
      y: rect.top + rect.height / 2 - popupHeight / 2
    })

    // Jika sudah ada popup yang terbuka, tutup dulu dengan animasi
    if (activePopups.length > 0) {
      // Hilangkan semua video terlebih dahulu
      setShowVideos([])

      // Tunggu animasi video selesai, baru tutup semua popup
      setTimeout(() => {
        setActivePopups([])

        // Setelah semua tertutup, baru munculkan popup baru
        setTimeout(() => {
          // Munculkan semua popup dengan delay bertahap
          const videoIds = ['sample1', 'sample2', 'sample9']
          videoIds.forEach((id, index) => {
            setTimeout(() => {
              setActivePopups((prev) => [...prev, id])
              // Munculkan video setelah popup selesai animasi
              setTimeout(() => {
                setShowVideos((prev) => [...prev, id])
              }, 500)
            }, index * 200)
          })
        }, 100)
      }, 100)
    } else {
      // Jika belum ada popup, langsung munculkan semua
      const videoIds = ['sample1', 'sample2', 'sample9']
      videoIds.forEach((id, index) => {
        setTimeout(() => {
          setActivePopups((prev) => [...prev, id])
          setTimeout(() => {
            setShowVideos((prev) => [...prev, id])
          }, 500)
        }, index * 200)
      })
    }
  }

  // Update overlay click handler juga
  const handleOverlayClick = () => {
    // Hilangkan semua video terlebih dahulu
    setShowVideos([])

    // Tunggu animasi video selesai, baru tutup semua popup
    setTimeout(() => {
      setActivePopups([])
    }, 300)
  }

  // Tambahkan fungsi untuk handle close dengan sequence
  const handleClosePopup = (popupId: string) => {
    // Hilangkan video terlebih dahulu
    setShowVideos((prev) => prev.filter((id) => id !== popupId))

    // Tunggu animasi video selesai, baru tutup popup
    setTimeout(() => {
      setActivePopups((prev) => prev.filter((id) => id !== popupId))
    }, 100) // Sesuaikan dengan durasi animasi video (0.3s)
  }

  const handleCopy = (id: string) => {
    if (id === 'ca-copy') {
      navigator.clipboard.writeText('Coming Soon')
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  const handleLoadMetadata = (popupId: string, event: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = event.target as HTMLVideoElement
    setVideoMetadata((prev) => ({
      ...prev,
      [popupId]: {
        width: video.videoWidth,
        height: video.videoHeight
      }
    }))
  }

  if (loading) return <div className="text-[#1E755C]">Loading...</div>
  if (error) return <div className="text-red-500">{error}</div>

  console.log('visibleTweets', visibleTweets)

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-1 pb-1">
        <AnimatePresence>
          {visibleTweets.map((item, index) => {
            if (item.type === 'social-icon') {
              return (
                <motion.div
                  key={item.mediaId}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 20,
                    delay: index * 0.1
                  }}
                  onClick={() => item.mediaId === 'ca-copy' && handleCopy(item.mediaId)}
                  className="flex w-20 h-20 flex-col items-center gap-1 text-primary-light hover:bg-primary-light/40 p-1 cursor-pointer rounded"
                >
                  <div className="w-12 h-12 relative pt-2 mt-2">
                    <Image
                      src={item.imagePath}
                      alt={item.label}
                      layout="fill"
                      objectFit="contain"
                      style={{
                        filter:
                          item.mediaId === 'ca-copy' && copiedId === item.mediaId
                            ? 'brightness(1.5) hue-rotate(180deg)'
                            : 'none'
                      }}
                      className={
                        item.mediaId === 'ca-copy' && copiedId === item.mediaId ? 'filter-cyan' : ''
                      }
                    />
                  </div>
                  <span className="text-xs text-center truncate w-full">
                    {item.mediaId === 'ca-copy'
                      ? copiedId === item.mediaId
                        ? 'Copied'
                        : 'CA'
                      : item.label}
                  </span>
                </motion.div>
              )
            } else if (item.type === 'bgm-control') {
              return (
                <motion.div
                  key="bgm-control"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 20,
                    delay: index * 0.1
                  }}
                  onClick={onToggleAudio}
                  className="flex w-20 h-20 flex-col items-center gap-1 text-primary-light hover:bg-primary-light/40 p-1 cursor-pointer rounded"
                >
                  <div className="w-14 h-14 relative">
                    <Image
                      src={isPlaying ? '/img/unmuted.png' : '/img/muted.png'}
                      alt="BGM control"
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <span className="text-xs text-center truncate w-full">
                    {isPlaying ? 'Stop BGM' : 'Play BGM'}
                  </span>
                </motion.div>
              )
            } else if (item.type === 'test-folder') {
              return (
                <motion.div
                  key={item.mediaId}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 20,
                    delay: index * 0.1
                  }}
                  onClick={(e) => (item.mediaId === 'dragon-gif' ? null : handleTestClick(e))}
                  className="flex w-20 h-20 flex-col items-center gap-1 text-primary-light hover:bg-primary-light/40 p-1 cursor-pointer rounded"
                >
                  <div className="w-14 h-14 relative">
                    <Image
                      src={
                        item.mediaId === 'dragon-gif' ? '/img/dragon.gif' : '/img/player_roko.png'
                      }
                      alt={item.mediaId === 'dragon-gif' ? 'Dragon Animation' : 'Video folder'}
                      layout="fill"
                      objectFit="contain"
                      unoptimized={item.mediaId === 'dragon-gif'} // Penting untuk GIF agar bisa animasi
                    />
                  </div>
                  <span className="text-xs text-center truncate w-full">
                    {item.mediaId === 'dragon-gif' ? 'Dragon' : `Test_${item.mediaId}`}
                  </span>
                </motion.div>
              )
            } else {
              return (
                <motion.div
                  key={item.mediaId}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 20,
                    delay: index * 0.1
                  }}
                  onClick={() => handleAudioClick(item.mediaUrl)}
                  className="flex w-20 h-20 flex-col items-center gap-1 text-primary-light hover:bg-primary-light/40 p-1 cursor-pointer rounded"
                >
                  <Icon
                    icon={
                      playingAudio === item.mediaUrl ? 'ri:folder-music-fill' : 'ri:folder-fill'
                    }
                    className="w-14 h-14"
                    style={{
                      color: playingAudio === item.mediaUrl ? '#1E755C' : 'var(--primary-light)'
                    }}
                  />
                  {item.caption ? (
                    <>
                      <span className="text-xs text-center truncate w-full">{item.caption}</span>
                    </>
                  ) : (
                    <span className="text-xs text-center truncate w-full">
                      Audio_{item.mediaId}
                    </span>
                  )}
                </motion.div>
              )
            }
          })}
        </AnimatePresence>
      </div>

      {/* Multiple Popups */}
      <AnimatePresence>
        {activePopups.map((popupId, index) => {
          const metadata = videoMetadata[popupId]
          // Calculate dimensions maintaining aspect ratio with max width/height constraints
          const maxWidth = window.innerWidth * 0.8
          const maxHeight = window.innerHeight * 0.8
          let width = metadata?.width || 320
          let height = metadata?.height || 300

          if (width > maxWidth) {
            const ratio = maxWidth / width
            width = maxWidth
            height = height * ratio
          }

          if (height > maxHeight) {
            const ratio = maxHeight / height
            height = maxHeight
            width = width * ratio
          }

          return (
            <motion.div
              key={popupId}
              initial={{
                scale: 0.5,
                opacity: 0,
                x: popupPosition.x,
                y: popupPosition.y
              }}
              animate={{
                scale: 1,
                opacity: 1,
                x: `${50 + (index - 1) * 20}%`,
                y: '50%'
              }}
              exit={{
                scale: 0,
                opacity: 0,
                x: popupPosition.x,
                y: popupPosition.y
              }}
              drag
              dragMomentum={false}
              dragConstraints={{
                left: 0,
                right: window.innerWidth - width,
                top: 0,
                bottom: window.innerHeight - height
              }}
              className="fixed top-0 left-0 cursor-move"
              style={{
                width: `${width}px`,
                height: `${height}px`,
                zIndex: 50 + index
              }}
            >
              {/* Background container dengan notched shape */}
              <div
                className="absolute inset-0"
                style={
                  {
                    '--slant': `${Math.min(20, Math.max(10, width * 0.05))}px`,
                    '--color': '#1E755C',
                    background: `
                    linear-gradient(to bottom left, var(--color) 50%, transparent 50.1%) top right,
                    linear-gradient(to top right, var(--color) 50%, transparent 50.1%) bottom left
                  `,
                    backgroundColor: '#020D06',
                    backgroundSize: 'calc(var(--slant) + 2px) calc(var(--slant) + 2px)',
                    backgroundRepeat: 'no-repeat',
                    boxShadow: `
                    0 0 0 200px inset #020D06,
                    0 0 0 1px inset var(--color)
                  `,
                    clipPath: `
                    polygon(
                      0 0, 
                      calc(100% - var(--slant)) 0,
                      100% var(--slant),
                      100% 100%,
                      0 100%
                    )
                  `
                  } as any
                }
              />

              {/* Border container dengan notched shape */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={
                  {
                    '--slant': `${Math.min(20, Math.max(10, width * 0.05))}px`,
                    border: '1px solid #1E755C',
                    clipPath: `
                    polygon(
                      0 0, 
                      calc(100% - var(--slant)) 0,
                      100% var(--slant),
                      100% 100%,
                      0 100%
                    )
                  `
                  } as any
                }
              />

              {/* Notch border */}
              <div
                className="absolute top-0 right-0 pointer-events-none"
                style={{
                  '--slant': `${Math.min(20, Math.max(10, width * 0.05))}px`,
                  width: 'var(--slant)',
                  height: 'var(--slant)',
                  borderTop: '1px solid #1E755C',
                  borderRight: '1px solid #1E755C',
                  transform: 'skew(45deg) translateX(-9px)'
                }}
              />

              {/* Content container */}
              <div className="relative z-10 h-full flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-start p-4">
                  <span className="text-[#1E755C] text-sm font-mono">
                    The Rise Of The Basilisk {popupId.replace('sample', '')}
                  </span>
                </div>

                {/* Video Container */}
                <div className="flex-grow px-4 pb-8 bg-[#020D06] border-[#1E755C] border-r-[0.5px] border-l-[0.5px]">
                  <AnimatePresence>
                    {showVideos.includes(popupId) && (
                      <video
                        src={`/videos/${popupId}.mp4`}
                        className="w-full h-full object-contain border-[0.5px] border-[#1E755C] border-r-[1.5px]"
                        controls
                        autoPlay
                        muted
                        loop
                        onLoadedMetadata={(e) => handleLoadMetadata(popupId, e)}
                      />
                    )}
                  </AnimatePresence>
                </div>

                {/* Close button container - sekarang mengikuti bentuk notched shape */}
                {showVideos.includes(popupId) && (
                  <div className="relative flex justify-end bg-[#020D06] p-2 border-[#1E755C] border-b-[0.5px] border-r-[0.5px] border-l-[0.5px]">
                    <div className="absolute bottom-0 right-0 bg-[#1E755C]">
                      <button
                        onClick={() => handleClosePopup(popupId)}
                        className="text-primary-light p-2 text-xs hover:text-[#2A9D7C]"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* Overlay dengan handler yang diupdate */}
      <AnimatePresence>
        {activePopups.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleOverlayClick}
            className="fixed inset-0 bg-black/2 z-40"
          />
        )}
      </AnimatePresence>
    </>
  )
}

export default AudioFolder
