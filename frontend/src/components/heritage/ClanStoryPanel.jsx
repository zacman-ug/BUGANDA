import { getTotemIcon } from '../../utils/heritageUtils';

export default function ClanStoryPanel({ clan, memberCount = 0, isPublic = false }) {
  if (!clan) {
    return (
      <div className="p-8 text-center text-gray-500 bg-white rounded-xl border">
        Select a clan to explore its shared Buganda heritage.
      </div>
    );
  }

  const icon = getTotemIcon(clan.totem, clan.name);
  const story = clan.description || `The ${clan.name} clan carries the totem ${clan.totem || 'unknown'} — part of the 55 great clans of Buganda.`;

  return (
    <div className="bg-white rounded-xl border-2 border-heritage-gold/30 overflow-hidden">
      <div className="bg-gradient-to-r from-heritage-dark to-black text-white p-6">
        <div className="flex items-start gap-4">
          <span className="w-16 h-16 rounded-full bg-heritage-cream/20 border-2 border-heritage-gold flex items-center justify-center text-lg font-bold">{icon}</span>
          <div>
            <h2 className="font-serif text-3xl font-bold">{clan.name}</h2>
            <p className="text-heritage-gold mt-1">Omuziro: {clan.totem || '—'}</p>
            {clan.head_title && <p className="text-sm text-gray-300 mt-1">Owekitiibwa: {clan.head_title}</p>}
          </div>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div>
          <h3 className="font-bold text-heritage-dark mb-2">Clan Heritage (Obusika bw&apos;Ekika)</h3>
          <p className="text-gray-700 leading-relaxed">{story}</p>
        </div>
        {!isPublic && memberCount > 0 && (
          <p className="text-sm bg-heritage-cream p-3 rounded-lg">
            <strong>{memberCount}</strong> members of your lineage belong to this clan.
          </p>
        )}
        {isPublic && (
          <p className="text-sm text-gray-500 italic">
            This is shared Buganda cultural heritage. Sign in to connect your private family lineage to this clan.
          </p>
        )}
      </div>
    </div>
  );
}
