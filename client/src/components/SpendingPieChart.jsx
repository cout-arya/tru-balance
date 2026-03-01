import { useEffect, useState } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const SpendingPieChart = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    axios.get(`${import.meta.env.PROD ? '' : 'http://localhost:5001'}/api/stats/spending-summary`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((res) => {
        const labels = res.data.map(item => item._id);
        const data = res.data.map(item => item.total);
        setChartData({
          labels,
          datasets: [{
            label: 'Spending by Category',
            data,
            backgroundColor: ['#7C3AED', '#C084FC', '#A78BFA', '#DDD6FE'],
            borderWidth: 1,
          }]
        });
      })
      .catch((err) => {
        console.error('Failed to load chart data:', err);
      });
  }, []);

  if (!chartData) return <p>Loading chart...</p>;

  return (
    <Pie
      data={chartData}
      options={{
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#4B5563', font: { size: 14 } }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const val = context.parsed;
                return `${context.label}: $${val.toFixed(2)}`;
              }
            }
          }
        }
      }}
    />
  );
};

export default SpendingPieChart;
