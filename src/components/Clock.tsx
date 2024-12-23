import { useState, useEffect } from 'react'

const Clock = () => {
  const [time, setTime] = useState<{ hours: string; minutes: string; seconds: string }>({
    hours: '00',
    minutes: '00',
    seconds: '00'
  })

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime({
        hours: now.getHours().toString().padStart(2, '0'),
        minutes: now.getMinutes().toString().padStart(2, '0'),
        seconds: now.getSeconds().toString().padStart(2, '0')
      })
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="text-4xl text-center text-primary-light  font-medium border-t border-[#1E755C] py-2 font-united tracking-[0.15em]">
      <span>{time.hours}</span>
      <span className="mx-3">:</span>
      <span>{time.minutes}</span>
      <span className="mx-3">:</span>
      <span>{time.seconds}</span>
    </div>
  )
}

export default Clock
