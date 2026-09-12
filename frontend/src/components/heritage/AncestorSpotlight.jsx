import { useEffect, useState } from 'react';
import { useHeritage } from '../../context/HeritageContext';
import TotemPersonNode from './TotemPersonNode';
import { LUGANDA } from '../../utils/heritageUtils';

export default function AncestorSpotlight() {
  const { api } = useHeritage();
  const [spotlight, setSpotlight] = useState(null);

  useEffect(() => {
    api.get('/api/heritage/spotlight').then(({ data }) => setSpotlight(data));
  }, [api]);

  if (!spotlight?.ancestor) {
    return <p className="text-gray-500 p-8 text-center">Add ancestors to see who anchors your heritage.</p>;
  }

  const { ancestor, descendant_count, narrative } = spotlight;

  return (
    <div className="bg-gradient-to-br from-heritage-cream to-white border-2 border-heritage-gold rounded-xl p-8">
      <p className="text-xs uppercase tracking-widest text-heritage-gold mb-4">Ancestor Spotlight</p>
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <TotemPersonNode person={ancestor} />
        <div className="flex-1">
          <h2 className="font-serif text-2xl font-bold text-heritage-dark">{ancestor.full_name}</h2>
          <p className="text-heritage-gold font-medium mt-1">{ancestor.clan_name} · {ancestor.clan_totem}</p>
          <p className="text-sm text-gray-600 mt-3">
            <strong>{descendant_count}</strong> descendants in your living heritage tree.
          </p>
          {ancestor.bio && (
            <blockquote className="mt-4 pl-4 border-l-4 border-heritage-gold italic text-gray-700">
              {LUGANDA.oralHistory}: &ldquo;{ancestor.bio}&rdquo;
            </blockquote>
          )}
          {narrative && (
            <p className="mt-4 text-sm text-gray-700 leading-relaxed">{narrative}</p>
          )}
        </div>
      </div>
    </div>
  );
}
