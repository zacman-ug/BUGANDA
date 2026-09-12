import React, { useState, useContext } from 'react';
import { HeritageContext } from '../context/HeritageContext';

/**
 * LineageViewer - Display ancestral lineage and descendants
 * Shows ancestors, descendants, and family connections
 */
const LineageViewer = ({ memberId, onClose }) => {
  const { individuals } = useContext(HeritageContext);
  const [expandedGenerations, setExpandedGenerations] = useState({
    ancestors: true,
    descendants: true
  });

  const member = individuals.find(p => p.id === memberId);
  if (!member) return null;

  // Get ancestors (parents, grandparents, etc.)
  const getAncestors = (personId, depth = 0, maxDepth = 5, visited = new Set()) => {
    if (depth > maxDepth || visited.has(personId)) return [];
    visited.add(personId);

    const person = individuals.find(p => p.id === personId);
    if (!person) return [];

    let ancestors = [];
    
    if (person.father_id) {
      const father = individuals.find(p => p.id === person.father_id);
      if (father) {
        ancestors.push({ ...father, generation: depth + 1, type: 'father' });
        ancestors = ancestors.concat(getAncestors(person.father_id, depth + 1, maxDepth, visited));
      }
    }

    if (person.mother_id) {
      const mother = individuals.find(p => p.id === person.mother_id);
      if (mother) {
        ancestors.push({ ...mother, generation: depth + 1, type: 'mother' });
        ancestors = ancestors.concat(getAncestors(person.mother_id, depth + 1, maxDepth, visited));
      }
    }

    return ancestors;
  };

  // Get descendants
  const getDescendants = (personId, depth = 0, maxDepth = 5, visited = new Set()) => {
    if (depth > maxDepth || visited.has(personId)) return [];
    visited.add(personId);

    const children = individuals.filter(p =>
      (p.father_id === personId || p.mother_id === personId) && !visited.has(p.id)
    );

    let descendants = children.map(child => ({ ...child, generation: depth + 1 }));

    children.forEach(child => {
      descendants = descendants.concat(getDescendants(child.id, depth + 1, maxDepth, visited));
    });

    return descendants;
  };

  const ancestors = getAncestors(memberId);
  const descendants = getDescendants(memberId);

  // Group by generation
  const ancestorsByGen = {};
  const descendantsByGen = {};

  ancestors.forEach(a => {
    const gen = `Generation ${a.generation}`;
    if (!ancestorsByGen[gen]) ancestorsByGen[gen] = [];
    ancestorsByGen[gen].push(a);
  });

  descendants.forEach(d => {
    const gen = `Generation ${d.generation}`;
    if (!descendantsByGen[gen]) descendantsByGen[gen] = [];
    descendantsByGen[gen].push(d);
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-heritage-dark to-black text-white p-6 flex justify-between items-start border-b border-heritage-gold/30">
          <div>
            <h2 className="text-3xl font-bold font-serif mb-2">🌳 Ancestral Lineage</h2>
            <p className="text-heritage-gold">{member.full_name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl hover:text-heritage-gold transition text-white"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Ancestors Section */}
          {ancestors.length > 0 && (
            <div>
              <button
                onClick={() => setExpandedGenerations(prev => ({
                  ...prev,
                  ancestors: !prev.ancestors
                }))}
                className="w-full flex items-center justify-between bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400 hover:bg-blue-100 transition font-bold text-blue-900"
              >
                <span>🔼 Ancestors ({ancestors.length})</span>
                <span>{expandedGenerations.ancestors ? '−' : '+'}</span>
              </button>

              {expandedGenerations.ancestors && (
                <div className="mt-4 space-y-4 ml-4 border-l-2 border-blue-200 pl-6">
                  {Object.entries(ancestorsByGen).map(([gen, genAncestors]) => (
                    <div key={gen}>
                      <h4 className="font-bold text-blue-900 mb-3 sticky top-16 bg-white py-2">
                        {gen} ({genAncestors.length})
                      </h4>
                      <div className="space-y-2">
                        {genAncestors.map(ancestor => (
                          <div
                            key={`${ancestor.id}-${ancestor.generation}`}
                            className="p-3 bg-blue-50 rounded border border-blue-200"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-blue-900">{ancestor.full_name}</p>
                                <p className="text-sm text-blue-700">
                                  {ancestor.type === 'father' ? '👨 Father' : '👩 Mother'} • {ancestor.clan_name}
                                </p>
                              </div>
                              <span className="text-lg">
                                {ancestor.gender === 'Male' ? '👨' : '👩'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Current Person */}
          <div className="bg-gradient-to-r from-heritage-gold/20 to-yellow-100 p-4 rounded-lg border-2 border-heritage-gold/50 text-center">
            <p className="text-sm text-gray-600 mb-2">Current Person</p>
            <p className="text-2xl font-bold text-heritage-dark">{member.full_name}</p>
            <p className="text-sm text-gray-700 mt-1">👤 {member.gender} • {member.clan_name}</p>
          </div>

          {/* Descendants Section */}
          {descendants.length > 0 && (
            <div>
              <button
                onClick={() => setExpandedGenerations(prev => ({
                  ...prev,
                  descendants: !prev.descendants
                }))}
                className="w-full flex items-center justify-between bg-green-50 p-4 rounded-lg border-l-4 border-green-400 hover:bg-green-100 transition font-bold text-green-900"
              >
                <span>🔽 Descendants ({descendants.length})</span>
                <span>{expandedGenerations.descendants ? '−' : '+'}</span>
              </button>

              {expandedGenerations.descendants && (
                <div className="mt-4 space-y-4 ml-4 border-l-2 border-green-200 pl-6">
                  {Object.entries(descendantsByGen).map(([gen, genDescendants]) => (
                    <div key={gen}>
                      <h4 className="font-bold text-green-900 mb-3 sticky top-16 bg-white py-2">
                        {gen} ({genDescendants.length})
                      </h4>
                      <div className="space-y-2">
                        {genDescendants.map(descendant => (
                          <div
                            key={`${descendant.id}-${descendant.generation}`}
                            className="p-3 bg-green-50 rounded border border-green-200"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-green-900">{descendant.full_name}</p>
                                <p className="text-sm text-green-700">
                                  {descendant.gender === 'Male' ? '♂ Son' : '♀ Daughter'} • {descendant.clan_name}
                                </p>
                              </div>
                              <span className="text-lg">
                                {descendant.gender === 'Male' ? '👨' : '👩'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* No ancestry info */}
          {ancestors.length === 0 && descendants.length === 0 && (
            <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-600">
              <p className="text-lg font-semibold mb-2">No lineage information available</p>
              <p className="text-sm">Add family relationships to build the family tree</p>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LineageViewer;
