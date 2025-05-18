import React from 'react';
import { Line } from 'react-chartjs-2';
import { useData } from '../../context/DataContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const SensorChart: React.FC = () => {
  const { sensorData } = useData();

  // ✅ Lọc và giới hạn dữ liệu hợp lệ
  const limitedData = [...sensorData]
    .filter(d => !!d.timestamp)
    .sort((a, b) => {
      const timeA = a.timestamp?.split(' ')[0] || '';
      const timeB = b.timestamp?.split(' ')[0] || '';
      return timeA.localeCompare(timeB);
    })
    .slice(-10); // Lấy 10 bản ghi gần nhất

  const labels = limitedData.map(d => d.timestamp?.split(' ')[0] || 'N/A');

  const data = {
    labels,
    datasets: [
      {
        label: 'Nhiệt độ (°C)',
        data: limitedData.map(d => d.temperature),
        borderColor: 'rgba(255, 99, 132, 1)',
        fill: false,
        tension: 0.4
      },
      {
        label: 'Độ ẩm (%)',
        data: limitedData.map(d => d.humidity),
        borderColor: 'rgba(54, 162, 235, 1)',
        fill: false,
        tension: 0.4
      },
      {
        label: 'Ánh sáng (lux)',
        data: limitedData.map(d => d.light),
        borderColor: 'rgba(255, 206, 86, 1)',
        fill: false,
        tension: 0.4
      }
    ]
  };

  // ✅ Gán đúng kiểu để tránh lỗi type
  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">Biểu đồ cảm biến</h2>
      <Line data={data} options={options} />
    </div>
  );
};

export default SensorChart;
