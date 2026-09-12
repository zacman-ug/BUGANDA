import { getTotemIcon, getClanColor, LUGANDA, LIFE_EVENT_META } from '../../utils/heritageUtils';
import PersonPhoto from '../PersonPhoto';

function ClanBadge({ person, compact, borderColor }) {
  const initials = getTotemIcon(person.clan_totem, person.clan_name);
  const size = compact ? 'w-10 h-10 text-xs' : 'w-14 h-14 text-sm';
  return (
    <div
      className={`mx-auto rounded-full flex items-center justify-center font-bold text-heritage-dark bg-heritage-cream border-2 ${size}`}
      style={{ borderColor }}
    >
      {initials}
    </div>
  );
}

export default function TotemPersonNode({ person, onClick, compact = false }) {
  const borderColor = getClanColor(person.clan_id, person.clan_name);
  const events = [];
  if (person.date_of_birth) events.push(LIFE_EVENT_META.birth);
  if (person.date_of_death) events.push(LIFE_EVENT_META.death);
  if (person.spouse_id) events.push(LIFE_EVENT_META.marriage);

  return (
    <div
      data-member-id={person.id}
      onClick={onClick}
      className={`inline-block bg-white rounded-xl m-2 text-center cursor-pointer hover:shadow-xl transition-all border-2 ${
        compact ? 'min-w-[120px] p-2' : 'min-w-[160px] p-3'
      }`}
      style={{ borderColor }}
      title={`${LUGANDA.clan}: ${person.clan_name || '—'} | ${LUGANDA.totem}: ${person.clan_totem || '—'}`}
    >
      {person.photo_url ? (
        <PersonPhoto
          src={person.photo_url}
          alt={person.full_name}
          className={`mx-auto rounded-full object-cover border-2 ${compact ? 'w-10 h-10' : 'w-14 h-14'}`}
          style={{ borderColor }}
        />
      ) : (
        <ClanBadge person={person} compact={compact} borderColor={borderColor} />
      )}
      <p className={`font-bold text-heritage-dark mt-1 ${compact ? 'text-xs' : 'text-sm'}`}>{person.full_name}</p>
      {!compact && (
        <>
          <p className="text-xs text-heritage-gold font-medium">{person.clan_name || 'Omuziro tezimanyiddwa'}</p>
          {person.clan_totem && <p className="text-[10px] text-gray-500">{person.clan_totem}</p>}
        </>
      )}
      {person.is_external && (
        <span className="text-[10px] text-blue-600 block mt-1">{LUGANDA.outsideFamily}</span>
      )}
      {events.length > 0 && !compact && (
        <div className="flex flex-wrap justify-center gap-1 mt-2">
          {events.map((e) => (
            <span key={e.label} className={`text-[10px] px-1.5 py-0.5 rounded border ${e.color}`}>{e.label}</span>
          ))}
        </div>
      )}
    </div>
  );
}
