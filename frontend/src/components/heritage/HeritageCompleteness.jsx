import { useEffect, useState } from 'react';
import { useHeritage } from '../../context/HeritageContext';

export default function HeritageCompleteness() {
  const { api, individuals } = useHeritage();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (individuals.length === 0) {
      setData({ score: 0, metrics: {}, message: 'Begin your heritage by adding your first ancestor.' });
      return;
    }
    api.get('/api/heritage/completeness').then(({ data: d }) => setData(d)).catch(() => {});
  }, [api, individuals]);

  if (!data) return null;

  const { score, metrics, message } = data;

  return (
    <div className="bg-gradient-to-br from-heritage-dark to-black text-white rounded-xl p-6 shadow-lg border border-heritage-gold/30">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="font-serif text-xl font-bold text-heritage-gold">Obusika Bwo (Your Heritage)</h3>
          <p className="text-sm text-gray-300 mt-1">{message}</p>
        </div>
        <div className="text-center">
          <p className="text-4xl font-bold text-heritage-gold">{score}%</p>
          <p className="text-xs text-gray-400">preserved</p>
        </div>
      </div>
      <div className="w-full bg-white/10 rounded-full h-3 mb-4">
        <div className="bg-heritage-gold h-3 rounded-full transition-all" style={{ width: `${score}%` }} />
      </div>
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <Metric label="Lives connected" value={metrics.lives_connected} />
          <Metric label="Generations" value={metrics.generations_documented} />
          <Metric label="Clans (emiziro)" value={metrics.clans_represented} />
          <Metric label="Stories told" value={metrics.ancestors_with_stories} />
          <Metric label="Parents linked" value={`${metrics.parents_linked}%`} />
          <Metric label="Omuziro recorded" value={`${metrics.omuziro_recorded}%`} />
          <Metric label="Life dates" value={`${metrics.life_dates_preserved}%`} />
          <Metric label="Photo memories" value={metrics.memories_with_photos} />
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="bg-white/5 rounded-lg p-2">
      <p className="text-gray-400 text-xs">{label}</p>
      <p className="font-bold text-heritage-gold">{value ?? '—'}</p>
    </div>
  );
}
