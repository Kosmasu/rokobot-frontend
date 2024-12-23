import { NextPage } from 'next'
import SimpleLayout from '@/components/SimpleLayout'
import React, { useEffect, useState } from 'react'
import { storyPromptService } from '@/services/api'

interface StoryPrompt {
  id?: number
  name: string
  description: string
  systemMessage: string
  userPrompt: string
  isActive: boolean
}

const StoryPromptPage: NextPage = () => {
  const [storyPrompts, setStoryPrompts] = useState<StoryPrompt[]>([])
  const [currentPrompt, setCurrentPrompt] = useState<StoryPrompt>({
    name: '',
    description: '',
    systemMessage: '',
    userPrompt: '',
    isActive: true
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    fetchStoryPrompts()
  }, [])

  const fetchStoryPrompts = async () => {
    try {
      const data = await storyPromptService.getStoryPrompts()
      setStoryPrompts(data)
    } catch (err) {
      setError('Failed to load story prompts')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      if (isEditing && currentPrompt.id) {
        await storyPromptService.updateStoryPrompt(currentPrompt.id, currentPrompt)
      } else {
        await storyPromptService.createStoryPrompt(currentPrompt)
      }
      setSuccessMessage(`Story prompt ${isEditing ? 'updated' : 'created'} successfully!`)
      fetchStoryPrompts()
      resetForm()
    } catch (err) {
      setError(`Failed to ${isEditing ? 'update' : 'create'} story prompt`)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this story prompt?')) return

    try {
      await storyPromptService.deleteStoryPrompt(id)
      setSuccessMessage('Story prompt deleted successfully!')
      fetchStoryPrompts()
    } catch (err) {
      setError('Failed to delete story prompt')
    }
  }

  const resetForm = () => {
    setCurrentPrompt({
      name: '',
      description: '',
      systemMessage: '',
      userPrompt: '',
      isActive: true
    })
    setIsEditing(false)
  }

  const editPrompt = (prompt: StoryPrompt) => {
    setCurrentPrompt(prompt)
    setIsEditing(true)
  }

  if (loading)
    return (
      <SimpleLayout>
        <div className="text-primary-light">Loading...</div>
      </SimpleLayout>
    )

  return (
    <SimpleLayout>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl text-primary-light mb-4">Story Prompt Editor</h1>

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
            <label className="block text-primary-light mb-2">Name</label>
            <input
              type="text"
              value={currentPrompt.name}
              onChange={(e) => setCurrentPrompt({ ...currentPrompt, name: e.target.value })}
              className="w-full bg-[#030E07] text-primary-light border border-[#1E755C] p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-primary-light mb-2">Description</label>
            <textarea
              value={currentPrompt.description}
              onChange={(e) => setCurrentPrompt({ ...currentPrompt, description: e.target.value })}
              className="w-full h-[10vh] bg-[#030E07] text-primary-light border border-[#1E755C] p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-primary-light mb-2">System Message</label>
            <textarea
              value={currentPrompt.systemMessage}
              onChange={(e) =>
                setCurrentPrompt({ ...currentPrompt, systemMessage: e.target.value })
              }
              className="w-full h-[20vh] bg-[#030E07] text-primary-light border border-[#1E755C] p-2 rounded font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-primary-light mb-2">User Prompt</label>
            <textarea
              value={currentPrompt.userPrompt}
              onChange={(e) => setCurrentPrompt({ ...currentPrompt, userPrompt: e.target.value })}
              className="w-full h-[20vh] bg-[#030E07] text-primary-light border border-[#1E755C] p-2 rounded font-mono"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={currentPrompt.isActive}
              onChange={(e) => setCurrentPrompt({ ...currentPrompt, isActive: e.target.checked })}
              className="bg-[#030E07] border border-[#1E755C] rounded"
            />
            <label className="text-primary-light">Active</label>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className={`
                px-6 py-2 bg-primary-light text-black rounded
                hover:opacity-80 transition-opacity
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {saving ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </button>

            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 border border-[#1E755C] text-primary-light rounded hover:bg-[#1E755C] transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="mt-8">
          <h2 className="text-xl text-primary-light mb-4">Existing Story Prompts</h2>
          <div className="space-y-4">
            {storyPrompts.map((prompt) => (
              <div
                key={prompt.id}
                className="border border-[#1E755C] rounded p-4 text-primary-light"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold">{prompt.name}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editPrompt(prompt)}
                      className="text-primary-light hover:text-primary-bright"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => prompt.id && handleDelete(prompt.id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="text-sm opacity-80 mb-2">{prompt.description}</p>
                <div className="text-xs opacity-60">
                  Status: {prompt.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SimpleLayout>
  )
}

export default StoryPromptPage
