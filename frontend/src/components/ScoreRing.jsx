import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const ScoreRing = ({ score = 0, label, color = '#38bdf8', size = 200, max = 1000 }) => {
  const data = {
    datasets: [
      {
        data: [score, max - score],
        backgroundColor: [color, 'rgba(255, 255, 255, 0.04)'],
        borderWidth: 0,
        circumference: 270,
        rotation: 225,
        cutout: '82%',
        borderRadius: 12,
      },
    ],
  };

  const options = {
    plugins: {
      tooltip: { enabled: false },
      legend: { display: false },
    },
    maintainAspectRatio: false,
    responsive: true,
    animation: {
      animateRotate: true,
      duration: 1200,
      easing: 'easeOutQuart'
    }
  };

  return (
    <div style={{ position: 'relative', width: `${size}px`, height: `${size}px`, margin: '0 auto' }}>
      <Doughnut data={data} options={options} />
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -40%)',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: size > 150 ? '2.2rem' : '1.5rem',
          fontWeight: '800',
          color: 'white',
          lineHeight: 1
        }}>{score}</div>
        <div style={{
          fontSize: size > 150 ? '0.7rem' : '0.6rem',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginTop: '4px'
        }}>
          {label}
        </div>
      </div>
    </div>
  );
};

export default ScoreRing;
