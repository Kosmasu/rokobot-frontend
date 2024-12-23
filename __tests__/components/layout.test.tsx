import { render, waitFor } from '@testing-library/react'
import Layout from '@/components/Layout'

jest.mock('next/head', () => {
  return {
    __esModule: true,
    default: ({ children }: { children: Array<React.ReactElement> }) => {
      return <>{children}</>
    }
  }
})

describe('Layout', () => {
  it('renders without crashing', () => {
    render(
      <Layout>
        <div>Test content</div>
      </Layout>
    )
    // Add your test assertions here
  })
})
