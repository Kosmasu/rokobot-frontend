import React, { createContext, useContext, useState, ReactNode } from 'react'

type KeyboardContextType = {
  activeKey: string | null
  setActiveKey: (key: string | null) => void
}

const KeyboardContext = createContext<KeyboardContextType | undefined>(undefined)

export const KeyboardProvider = ({ children }: { children: ReactNode }) => {
  const [activeKey, setActiveKey] = useState<string | null>(null)

  return (
    <KeyboardContext.Provider value={{ activeKey, setActiveKey }}>
      {children}
    </KeyboardContext.Provider>
  )
}

export const useKeyboard = () => {
  const context = useContext(KeyboardContext)
  if (context === undefined) {
    throw new Error('useKeyboard must be used within a KeyboardProvider')
  }
  return context
}
