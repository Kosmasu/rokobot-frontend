import React, { useEffect, useRef } from 'react'
import { useKeyboard } from '@/context/KeyboardContext'

const VirtualKeyboard = () => {
  const { activeKey, setActiveKey } = useKeyboard()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const lastKeyPressTime = useRef<number>(0)

  useEffect(() => {
    audioRef.current = new Audio('/sounds/folder.mp3')
    audioRef.current.volume = 0.5
  }, [])

  useEffect(() => {
    const handleKeyboardPress = (e: KeyboardEvent) => {
      const currentTime = Date.now()
      if (currentTime - lastKeyPressTime.current > 50) {
        setActiveKey(e.key.toUpperCase())

        if (audioRef.current) {
          const sound = audioRef.current.cloneNode() as HTMLAudioElement
          sound.volume = 0.5
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          sound.play().catch(() => {})
          lastKeyPressTime.current = currentTime

          setTimeout(() => {
            sound.pause()
            sound.currentTime = 0
          }, 100)
        }

        setTimeout(() => {
          setActiveKey(null)
        }, 150)
      }
    }

    const handleKeyUp = () => {
      setActiveKey(null)
    }

    window.addEventListener('keydown', handleKeyboardPress)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyboardPress)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [setActiveKey])

  const keyboardLayout = [
    ['Esc', '`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Back'],
    ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
    ['Caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'Enter'],
    ['Shift_L', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'Shift_R', '↑'],
    ['Ctrl_L', 'Opt_L', 'Cmd_L', 'Space', 'Cmd_R', 'Opt_R', '←', '↓', '→']
  ]

  return (
    <div className="virtual-keyboard text-xl w-full">
      {keyboardLayout.map((row, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex gap-1 mb-2">
          {row.map((key, colIndex) => {
            const buttonKey = key || `empty-${rowIndex}-${colIndex}`
            const uniqueKey = `key-${rowIndex}-${colIndex}-${buttonKey}`

            const getDisplayText = (key: string) => {
              if (!key) return ''
              if (key.startsWith('Shift_')) return 'Shift'
              if (key.startsWith('Cmd_')) return 'Cmd'
              if (key.startsWith('Opt_')) return 'Opt'
              if (key.startsWith('Ctrl_')) return 'Ctrl'
              return key
            }

            return (
              <div
                key={uniqueKey}
                className={`
                  text-lg
                  px-2 py-0 min-w-[45px] h-[35px]
                  text-primary-light
                  ${!key ? 'invisible' : ''}
                  ${key === 'Space' || key === 'Enter' ? 'border-[0.5px] border-primary-light' : ''}
                  ${key === 'Space' ? 'w-[320px]' : ''}
                  ${key === 'Enter' ? 'w-[130px]' : ''}
                  ${key.startsWith('Shift_') ? 'w-[73px]' : ''}
                  ${
                    ['←', '↑', '↓', '→'].includes(key)
                      ? 'w-[45px] h-[35px] text-3xl text-center border-[0.5px] border-primary-light font-extrabold'
                      : ''
                  }
                  ${key.startsWith('Cmd_') ? 'min-w-[50px]' : ''}
                  ${activeKey === key ? 'bg-primary-light/40 text-primary-light' : ''}
                  ${
                    activeKey === 'SHIFT' && key.startsWith('Shift_')
                      ? 'bg-primary-light text-[#030E07]'
                      : ''
                  }
                  ${activeKey === ' ' && key === 'Space' ? 'bg-primary-light text-[#030E07]' : ''}
                  ${
                    activeKey === 'ENTER' && key === 'Enter'
                      ? 'bg-primary-light text-[#030E07]'
                      : ''
                  }
                  ${
                    activeKey === 'ESCAPE' && key === 'Esc' ? 'bg-primary-light text-[#030E07]' : ''
                  }
                  ${
                    activeKey === 'BACKSPACE' && key === 'Back'
                      ? 'bg-primary-light text-[#030E07]'
                      : ''
                  }
                  ${
                    activeKey === 'CONTROL' && key.startsWith('Ctrl_')
                      ? 'bg-primary-light text-[#030E07]'
                      : ''
                  }
                  ${
                    activeKey === 'ARROWLEFT' && key === '←'
                      ? 'bg-primary-light text-[#030E07]'
                      : ''
                  }
                  ${
                    activeKey === 'ARROWRIGHT' && key === '→'
                      ? 'bg-primary-light text-[#030E07]'
                      : ''
                  }
                  ${activeKey === 'ARROWUP' && key === '↑' ? 'bg-primary-light text-[#030E07]' : ''}
                  ${
                    activeKey === 'ARROWDOWN' && key === '↓'
                      ? 'bg-primary-light text-[#030E07]'
                      : ''
                  }
                `}
              >
                {getDisplayText(key)}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default VirtualKeyboard
