import { render, screen } from '@testing-library/react'
import App from '@/pages/index'

beforeAll(() => {
  // Mock scrollIntoView
  window.HTMLElement.prototype.scrollIntoView = jest.fn()
})

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />)
    // Add your test assertions here
  })
})
