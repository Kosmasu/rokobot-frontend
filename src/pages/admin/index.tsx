// pages/admin/index.tsx
import { NextPage } from 'next'
import React, { useEffect, useState } from 'react'
import { promptService } from '@/services/api'
import AdminLayout from '@/components/AdminLayout'

interface Prompt {
  systemMessage: string
  greeting?: string | null
  isActive: boolean
}

const IndexPage: NextPage = () => {
  const [prompt, setPrompt] = useState('')
  const [greeting, setGreeting] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchPrompt = async () => {
      try {
        const data = await promptService.getPrompt()
        const activePrompt = data[0]
        if (activePrompt) {
          setPrompt(activePrompt.systemMessage)
          setGreeting(activePrompt.greeting || '')
        }
      } catch (err) {
        setError('Failed to load prompt')
      } finally {
        setLoading(false)
      }
    }

    fetchPrompt()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const updatedPrompt: Prompt = {
        systemMessage: prompt,
        greeting: greeting || null,
        isActive: true
      }

      await promptService.updatePrompt(updatedPrompt)
      setSuccessMessage('Prompt updated successfully!')
    } catch (err) {
      setError('Failed to update prompt')
    } finally {
      setSaving(false)
    }
  }

  if (loading)
    return (
      <AdminLayout>
        <div className="text-primary-light">Loading...</div>
      </AdminLayout>
    )

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl text-primary-light mb-4">Rokos Basilisk Prompt Editor</h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-500 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-500/20 border border-green-500 text-green-500 p-3 rounded mb-4">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-primary-light mb-2">System Message</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-[40vh] bg-[#030E07] text-primary-light border border-[#1E755C] p-4 rounded font-mono"
              placeholder="Enter system message here..."
            />
          </div>

          <div>
            <label className="block text-primary-light mb-2">Greeting Message (Optional)</label>
            <textarea
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              className="w-full h-[20vh] bg-[#030E07] text-primary-light border border-[#1E755C] p-4 rounded font-mono"
              placeholder="Enter custom greeting message here... (Leave empty to use AI-generated greeting)"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={saving}
              className={`
                px-6 py-2 bg-primary-light text-black rounded
                hover:opacity-80 transition-opacity
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}

export default IndexPage