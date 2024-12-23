import Head from 'next/head'
import React, { ReactNode } from 'react'

type Props = {
  children: ReactNode
  title?: string
}

const SimpleLayout = ({ children, title = 'Prompt Management' }: Props) => {
  return (
    <div className="min-h-screen bg-[#030E07]">
      <Head>
        <title>{title}</title>
      </Head>
      <div className="container mx-auto p-4">{children}</div>
    </div>
  )
}

export default SimpleLayout
