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

const CpuUsageChart = () => {
  const [data, setData] = useState({
    labels: Array.from({ length: 50 }, (_, i) => i.toString()),
    datasets: [
      {
        label: 'CPU Usage',
        data: Array.from({ length: 50 }, () => Math.random() * 100),
        borderColor: '#66DCB7',
        backgroundColor: 'rgba(30, 117, 92, 0.1)',
        borderWidth: 0.8,
        tension: 0.4,
        fill: true
      }
    ]
  })

  const [lastValue, setLastValue] = useState(50)

  // Simulasi update data real-time
  useEffect(() => {
    const interval = setInterval(() => {
      setLastValue((prev) => {
        // 70% chance untuk pergerakan tajam, 30% untuk landai
        const isSharp = Math.random() < 0.7

        if (isSharp) {
          // Pergerakan tajam: langsung random nilai baru
          return Math.random() * 100
        } else {
          // Pergerakan landai: perubahan kecil dari nilai sebelumnya
          const change = (Math.random() - 0.5) * 20
          return Math.max(0, Math.min(100, prev + change))
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
    }, 100)

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
        tension: 0.4
      }
    },
    scales: {
      x: {
        display: false
      },
      y: {
        display: false
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

export default CpuUsageChart
