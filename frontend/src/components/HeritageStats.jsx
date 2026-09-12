import React from 'react';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';

// Registering the components Chart.js needs to draw a Bar Chart
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const HeritageStats = ({ data }) => {
  // Defensive check: if data isn't an array yet, show nothing or a loader
  if (!data || data.length === 0) {
    return <div className="p-6 bg-white rounded-xl shadow-md text-gray-400">Waiting for records to analyze...</div>;
  }

  // Logic: Transform the list of people into counts per clan
  const clanCounts = data.reduce((acc, person) => {
    const clan = person.clan_name || "Unassigned";
    acc[clan] = (acc[clan] || 0) + 1;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(clanCounts),
    datasets: [
      {
        label: 'Members Registered',
        data: Object.values(clanCounts),
        backgroundColor: '#D4AF37', // Our custom Heritage Gold
        borderRadius: 5,
      },
    ],
  };

  return (
    <div className="relative animate-slide-up">
      {/* Decorative header accent */}
      <div className="absolute -top-1 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-heritage-gold to-transparent rounded-full"></div>
      
      <div className="bg-gradient-to-br from-white via-heritage-light to-white p-6 rounded-xl shadow-heritage border-2 border-heritage-gold/20 hover:shadow-heritage-lg transition-all duration-300 overflow-hidden group">
        {/* Background decorative element */}
        <div className="absolute top-2 right-2 text-heritage-gold text-opacity-10 text-6xl font-serif font-bold">📊</div>
        
        <h3 className="text-lg font-bold mb-6 text-heritage-dark font-serif relative z-10 flex items-center gap-3">
          <span className="text-2xl">👥</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-heritage-dark to-heritage-gold">Clan Distribution Heritage</span>
        </h3>
        <div className="relative z-10">
          <Bar data={chartData} options={{ responsive: true }} />
        </div>
      </div>
    </div>
  );
};

export default HeritageStats;