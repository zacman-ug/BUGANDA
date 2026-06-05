import React from 'react';

/**
 * FamilyCard Component
 * Purpose: Displays a summary of an individual's heritage data.
 * @param {Object} person - The data object containing name, clan, etc.
 * @param {Function} onViewLineage - Callback when viewing lineage details
 */
const FamilyCard = ({ person, onViewLineage }) => {
  return (
    <div className="relative animate-fade-in">
      {/* Decorative background accent */}
      <div className="absolute top-0 left-0 w-1 h-16 bg-gradient-to-b from-heritage-gold to-transparent rounded-r-full"></div>
      
      <div className="bg-gradient-to-br from-white via-heritage-light to-white p-6 shadow-heritage rounded-xl border-2 border-heritage-gold/20 hover:shadow-heritage-lg hover:border-heritage-gold/40 transition-all duration-300 group">
        {/* Ornamental corner accent */}
        <div className="absolute top-3 right-3 text-heritage-gold text-opacity-30 text-2xl">✦</div>
        
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold font-serif text-heritage-dark group-hover:text-heritage-gold transition-colors duration-300">
              {person.full_name}
            </h3>
            <p className="text-sm text-heritage-gold font-serif font-semibold mt-2 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-heritage-gold"></span>
              {person.clan_name || "Unknown Clan"}
            </p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className={`w-12 h-12 flex items-center justify-center rounded-full font-bold text-lg ${
              person.gender === 'Male' 
                ? 'bg-blue-100 text-blue-600 border-2 border-blue-300' 
                : 'bg-pink-100 text-pink-600 border-2 border-pink-300'
            }`}>
              {person.gender === 'Male' ? '♂' : '♀'}
            </span>
            <span className="text-xs font-semibold text-gray-600">
              {person.gender === 'Male' ? 'Musajja' : 'Mukazi'}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-heritage-gold/20 text-gray-600 text-sm italic font-serif">
          {person.bio ? `"${person.bio.substring(0, 60)}..."` : "No oral history recorded yet."}
        </div>

        <button 
          onClick={() => onViewLineage?.(person.id)}
          className="mt-6 w-full relative overflow-hidden bg-gradient-to-r from-heritage-gold to-heritage-bronze text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-300 group/btn before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-white before:translate-y-full hover:before:translate-y-0 before:transition-transform before:duration-300">
          <span className="relative z-10 group-hover/btn:text-heritage-gold transition-colors duration-300">
            View Lineage Details
          </span>
        </button>
      </div>
    </div>
  );
};

export default FamilyCard; 