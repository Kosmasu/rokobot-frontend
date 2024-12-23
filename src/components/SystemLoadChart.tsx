import React, { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const SystemLoadChart = () => {
  const [data, setData] = useState({
    labels: Array.from({ length: 50 }, (_, i) => i.toString()),
    datasets: [
      {
        label: 'System Load',
        data: Array.from({ length: 50 }, () => Math.random() * 60), // Menggunakan range 0-60
        borderColor: '#66DCB7',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderWidth: 1,
        tension: 0.3,
        fill: true
      }
    ]
  })

  const [lastValue, setLastValue] = useState(30)

  useEffect(() => {
    const interval = setInterval(() => {
      setLastValue((prev) => {
        const isSharp = Math.random() < 0.7

        if (isSharp) {
          // Pergerakan tajam dengan range yang lebih kecil (0-60)
          return Math.random() * 60
        } else {
          // Pergerakan landai dengan perubahan yang lebih kecil
          const change = (Math.random() - 0.5) * 10 // Perubahan lebih kecil
          return Math.max(0, Math.min(60, prev + change))
        }
      })

      setData((prevData) => ({
        ...prevData,
        datasets: [
          {
            ...prevData.datasets[0],
            data: [...prevData.datasets[0].data.slice(1), lastValue]
          }
        ]
      }))
    }, 120)

    return () => clearInterval(interval)
  }, [lastValue])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    elements: {
      point: {
        radius: 0
      },
      line: {
        tension: 0.3
      }
    },
    scales: {
      x: {
        display: false
      },
      y: {
        display: false,
        min: 0,
        max: 60
      }
    },
    animation: {
      duration: 0
    }
  }

  return (
    <div style={{ height: '30px', width: '200px' }}>
      <Line data={data} options={options} />
    </div>
  )
}

export default SystemLoadChart
