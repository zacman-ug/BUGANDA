import React, { useState } from 'react';
import LineageViewer from './LineageViewer';

/**
 * MemberDetailsPanel - Displays comprehensive member information
 * Shows genealogical data, relationships, and options
 */
const MemberDetailsPanel = ({ member, onClose, onEdit, individuals = [] }) => {
  const [expandedSection, setExpandedSection] = useState(null);
  const [showLineage, setShowLineage] = useState(false);

  if (!member) return null;

  if (showLineage) {
    return <LineageViewer memberId={member.id} onClose={() => setShowLineage(false)} />;
  }

  // Find parent and children info
  const father = member.father_id 
    ? individuals.find(p => p.id === member.father_id) 
    : null;
  const mother = member.mother_id 
    ? individuals.find(p => p.id === member.mother_id) 
    : null;
  const children = individuals.filter(p => p.father_id === member.id || p.mother_id === member.id);
  const siblings = individuals.filter(p => 
    (p.father_id === father?.id || p.mother_id === mother?.id) && p.id !== member.id
  );

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-heritage-dark to-black text-white p-6 flex justify-between items-start border-b border-heritage-gold/30">
          <div>
            <h2 className="text-3xl font-bold font-serif mb-2">{member.full_name}</h2>
            <p className="text-heritage-gold">{member.clan_name || 'Unassigned Clan'}</p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl hover:text-heritage-gold transition text-white"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Basic Info */}
          <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-heritage-gold">
            <h3 className="font-bold text-lg text-heritage-dark mb-3">👤 Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Gender</p>
                <p className="font-semibold text-heritage-dark">{member.gender}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Clan</p>
                <p className="font-semibold text-heritage-dark">{member.clan_name || 'N/A'}</p>
              </div>
            </div>
            {member.bio && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-gray-600 text-sm">Biography</p>
                <p className="text-gray-700 italic">{member.bio}</p>
              </div>
            )}
          </div>

          {/* Family Tree Section */}
          {(father || mother) && (
            <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
              <button
                onClick={() => toggleSection('parents')}
                className="w-full flex justify-between items-center font-bold text-lg text-heritage-dark hover:text-blue-600 transition"
              >
                <span>👨‍👩‍👧 Parents</span>
                <span>{expandedSection === 'parents' ? '−' : '+'}</span>
              </button>
              {expandedSection === 'parents' && (
                <div className="mt-3 space-y-2">
                  {father && (
                    <div className="p-2 bg-white rounded border border-blue-200">
                      <p className="text-sm text-gray-600">Father (Kitaawe)</p>
                      <p className="font-semibold text-heritage-dark">{father.full_name}</p>
                    </div>
                  )}
                  {mother && (
                    <div className="p-2 bg-white rounded border border-blue-200">
                      <p className="text-sm text-gray-600">Mother (Nnyina)</p>
                      <p className="font-semibold text-heritage-dark">{mother.full_name}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Children Section */}
          {children.length > 0 && (
            <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-400">
              <button
                onClick={() => toggleSection('children')}
                className="w-full flex justify-between items-center font-bold text-lg text-heritage-dark hover:text-purple-600 transition"
              >
                <span>👶 Children ({children.length})</span>
                <span>{expandedSection === 'children' ? '−' : '+'}</span>
              </button>
              {expandedSection === 'children' && (
                <div className="mt-3 space-y-2">
                  {children.map(child => (
                    <div key={child.id} className="p-2 bg-white rounded border border-purple-200">
                      <p className="font-semibold text-heritage-dark">{child.full_name}</p>
                      <p className="text-sm text-gray-600">{child.gender} • {child.clan_name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Siblings Section */}
          {siblings.length > 0 && (
            <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
              <button
                onClick={() => toggleSection('siblings')}
                className="w-full flex justify-between items-center font-bold text-lg text-heritage-dark hover:text-green-600 transition"
              >
                <span>👥 Siblings ({siblings.length})</span>
                <span>{expandedSection === 'siblings' ? '−' : '+'}</span>
              </button>
              {expandedSection === 'siblings' && (
                <div className="mt-3 space-y-2">
                  {siblings.map(sibling => (
                    <div key={sibling.id} className="p-2 bg-white rounded border border-green-200">
                      <p className="font-semibold text-heritage-dark">{sibling.full_name}</p>
                      <p className="text-sm text-gray-600">{sibling.gender} • {sibling.clan_name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* No family info */}
          {!father && !mother && children.length === 0 && siblings.length === 0 && (
            <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-600">
              <p>No family relationships recorded for this member.</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={() => setShowLineage(true)}
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              🌳 View Lineage
            </button>
            <button
              onClick={() => {
                onEdit?.(member);
                onClose();
              }}
              className="flex-1 bg-heritage-gold hover:bg-yellow-500 text-heritage-dark font-bold py-2 px-4 rounded-lg transition"
            >
              ✎ Edit Member
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDetailsPanel;
