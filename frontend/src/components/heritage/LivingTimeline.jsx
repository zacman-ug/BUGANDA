import { useEffect, useState } from 'react';
import { useHeritage } from '../../context/HeritageContext';
import { LIFE_EVENT_META } from '../../utils/heritageUtils';

export default function LivingTimeline() {
  const { api } = useHeritage();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api.get('/api/heritage/timeline').then(({ data }) => setEvents(data.events || []));
  }, [api]);

  if (events.length === 0) {
    return <p className="text-gray-500 p-8 text-center">Add birth dates, death dates, or marriage records to see Ekiseera (your living timeline).</p>;
  }

  return (
    <div className="relative pl-8 border-l-2 border-heritage-gold ml-4 space-y-6">
      {events.map((event, i) => {
        const meta = LIFE_EVENT_META[event.type] || LIFE_EVENT_META.birth;
        return (
          <div key={i} className="relative">
            <div className="absolute -left-[41px] w-8 h-8 rounded-full bg-heritage-gold flex items-center justify-center text-sm">
              {meta.icon}
            </div>
            <div className={`p-4 rounded-lg border-l-4 ${meta.color}`}>
              <p className="text-xs font-semibold uppercase">{meta.label}</p>
              <p className="font-bold text-heritage-dark">{event.title}</p>
              <p className="text-sm text-gray-600">
                {new Date(event.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                {event.clan && ` · ${event.clan}`}
                {event.location && ` · ${event.location}`}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
