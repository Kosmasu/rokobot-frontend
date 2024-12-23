import React from 'react'
import '@/styles/globals.css'
import '@/styles/tailwind.css'

import { ModalProvider, ToastProvider } from '@apideck/components'
import { KeyboardProvider } from '@/context/KeyboardContext'

import { AppProps } from 'next/app'
export default function App({ Component, pageProps }: AppProps): React.ReactElement {
  return (
    <KeyboardProvider>
      <ToastProvider>
        <ModalProvider>
          <Component {...pageProps} />
        </ModalProvider>
      </ToastProvider>
    </KeyboardProvider>
  )
}
