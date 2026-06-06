import React, { useState, useMemo, useCallback } from 'react';

/**
 * GenerationalFamilyTree Component
 * Displays a 4-generation family tree with circular nodes
 * Males: Blue circles | Females: Pink circles
 * Clean horizontal layout with vertical/horizontal connector lines
 */
const GenerationalFamilyTree = ({ individuals = [], rootPersonId = null }) => {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  // Build family relationships and organize by generation
  const treeData = useMemo(() => {
    if (!individuals || individuals.length === 0) return { generations: [], relationships: [] };

    // Helper function to find person by ID
    const findPerson = (id) => individuals.find(p => p.id === id);

    // Helper to get person's generation
    const getGeneration = (personId, personMap = new Map()) => {
      if (personMap.has(personId)) return personMap.get(personId);

      const person = findPerson(personId);
      if (!person) return 0;

      if (!person.father_id && !person.mother_id) {
        personMap.set(personId, 0); // Root generation
        return 0;
      }

      let maxParentGen = 0;
      if (person.father_id) {
        maxParentGen = Math.max(maxParentGen, getGeneration(person.father_id, personMap));
      }
      if (person.mother_id) {
        maxParentGen = Math.max(maxParentGen, getGeneration(person.mother_id, personMap));
      }

      const generation = maxParentGen + 1;
      personMap.set(personId, generation);
      return generation;
    };

    // Calculate generations for all individuals
    const generationMap = new Map();
    individuals.forEach(person => {
      getGeneration(person.id, generationMap);
    });

    // Organize by generation (limit to 4 generations)
    const generations = [[], [], [], []];
    individuals.forEach(person => {
      const gen = generationMap.get(person.id) || 0;
      if (gen < 4) {
        generations[gen].push(person);
      }
    });

    // Identify couples (people with same partner or multiple children together)
    const couples = [];
    const couplesSet = new Set();

    individuals.forEach(person => {
      if (person.spouse_id && !couplesSet.has(`${Math.min(person.id, person.spouse_id)}-${Math.max(person.id, person.spouse_id)}`)) {
        const spouse = findPerson(person.spouse_id);
        if (spouse) {
          couples.push({ person1: person, person2: spouse });
          couplesSet.add(`${Math.min(person.id, person.spouse_id)}-${Math.max(person.id, person.spouse_id)}`);
        }
      }
    });

    return { generations, couples, generationMap };
  }, [individuals]);

  // SVG dimensions and spacing
  const CANVAS_WIDTH = 1400;
  const CANVAS_HEIGHT = 1000;
  const NODE_RADIUS = 35;
  const GEN_SPACING = (CANVAS_HEIGHT - 100) / 4;
  const VERT_OFFSET = 50;

  // Calculate positions for nodes
  const nodePositions = useMemo(() => {
    const positions = new Map();
    let columnCount = [0, 0, 0, 0];

    treeData.generations.forEach((gen, generationIndex) => {
      const genCount = gen.length;
      const totalWidth = CANVAS_WIDTH - 100;
      const nodeSpacing = genCount > 1 ? totalWidth / (genCount + 1) : totalWidth / 2;

      gen.forEach((person, nodeIndex) => {
        const x = 50 + (nodeIndex + 1) * nodeSpacing;
        const y = VERT_OFFSET + generationIndex * GEN_SPACING;
        positions.set(person.id, { x, y, generation: generationIndex });
        columnCount[generationIndex]++;
      });
    });

    return positions;
  }, [treeData]);

  // Draw connector lines for parent-child relationships
  const renderConnectors = () => {
    const lines = [];
    let lineId = 0;

    individuals.forEach(person => {
      const childPos = nodePositions.get(person.id);
      if (!childPos) return;

      // Connect to father
      if (person.father_id) {
        const fatherPos = nodePositions.get(person.father_id);
        if (fatherPos) {
          const midY = (fatherPos.y + childPos.y) / 2;
          lines.push(
            <line
              key={`vert-${lineId++}`}
              x1={fatherPos.x}
              y1={fatherPos.y + NODE_RADIUS}
              x2={fatherPos.x}
              y2={midY}
              stroke="#CBD5E1"
              strokeWidth="2"
            />
          );
          lines.push(
            <line
              key={`horiz-${lineId++}`}
              x1={fatherPos.x}
              y1={midY}
              x2={childPos.x}
              y2={midY}
              stroke="#CBD5E1"
              strokeWidth="2"
            />
          );
          lines.push(
            <line
              key={`vert2-${lineId++}`}
              x1={childPos.x}
              y1={midY}
              x2={childPos.x}
              y2={childPos.y - NODE_RADIUS}
              stroke="#CBD5E1"
              strokeWidth="2"
            />
          );
        }
      }
    });

    return lines;
  };

  // Draw couple connector lines (horizontal lines between spouses)
  const renderCoupleConnectors = () => {
    const lines = [];
    let lineId = 0;

    treeData.couples.forEach(couple => {
      const pos1 = nodePositions.get(couple.person1.id);
      const pos2 = nodePositions.get(couple.person2.id);

      if (pos1 && pos2) {
        const minX = Math.min(pos1.x, pos2.x);
        const maxX = Math.max(pos1.x, pos2.x);
        const yPos = Math.max(pos1.y, pos2.y);

        lines.push(
          <line
            key={`couple-${lineId++}`}
            x1={minX + NODE_RADIUS}
            y1={yPos}
            x2={maxX - NODE_RADIUS}
            y2={yPos}
            stroke="#D4AF37"
            strokeWidth="3"
            opacity="0.6"
          />
        );
      }
    });

    return lines;
  };

  // Render individual nodes
  const renderNodes = () => {
    const nodes = [];

    individuals.forEach(person => {
      const pos = nodePositions.get(person.id);
      if (!pos || pos.generation >= 4) return;

      const isHovered = hoveredNode === person.id;
      const isSelected = selectedNode?.id === person.id;
      const isMale = person.gender === 'Male';
      const circleColor = isMale ? '#3B82F6' : '#EC4899';

      nodes.push(
        <g key={`node-${person.id}`}>
          {/* Circle node */}
          <circle
            cx={pos.x}
            cy={pos.y}
            r={NODE_RADIUS}
            fill={circleColor}
            opacity={isHovered || isSelected ? 1 : 0.85}
            stroke={isSelected ? '#D4AF37' : '#ffffff'}
            strokeWidth={isSelected ? 3 : 2}
            style={{
              cursor: 'pointer',
              filter: isHovered ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={() => setHoveredNode(person.id)}
            onMouseLeave={() => setHoveredNode(null)}
            onClick={() => setSelectedNode(isSelected ? null : person)}
          />

          {/* Gender symbol inside circle */}
          <text
            x={pos.x}
            y={pos.y - 5}
            textAnchor="middle"
            fontSize="20"
            fill="white"
            fontWeight="bold"
            pointerEvents="none"
          >
            {isMale ? '♂' : '♀'}
          </text>

          {/* Name below circle */}
          <text
            x={pos.x}
            y={pos.y + NODE_RADIUS + 25}
            textAnchor="middle"
            fontSize="13"
            fontWeight="600"
            fill="#1F2937"
            pointerEvents="none"
            style={{ maxWidth: NODE_RADIUS * 3 }}
          >
            {person.full_name.split(' ')[0]}
          </text>
          <text
            x={pos.x}
            y={pos.y + NODE_RADIUS + 40}
            textAnchor="middle"
            fontSize="13"
            fontWeight="600"
            fill="#1F2937"
            pointerEvents="none"
          >
            {person.full_name.split(' ').slice(1).join(' ') || ''}
          </text>

          {/* Hover tooltip */}
          {isHovered && (
            <g pointerEvents="none">
              <rect
                x={pos.x - 80}
                y={pos.y - NODE_RADIUS - 40}
                width="160"
                height="35"
                rx="4"
                fill="#1F2937"
                opacity="0.95"
              />
              <text
                x={pos.x}
                y={pos.y - NODE_RADIUS - 15}
                textAnchor="middle"
                fontSize="11"
                fill="#FFFFFF"
                fontWeight="bold"
              >
                {person.full_name}
              </text>
            </g>
          )}
        </g>
      );
    });

    return nodes;
  };

  if (!individuals || individuals.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-heritage-light rounded-lg p-8">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-2">No family data available</p>
          <p className="text-gray-500">Add members to your family tree to see the visualization</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-lg overflow-hidden generational-tree-container">
      <div className="bg-gradient-to-r from-heritage-dark to-black text-white p-6 generational-tree-header print:hidden">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span>🌳</span> Generational Family Tree
        </h2>
        <p className="text-gray-300 text-sm mt-2">
          Blue circles: Males | Pink circles: Females | Gold lines: Couples | Gray lines: Parent-child relationships
        </p>
      </div>

      <div className="overflow-x-auto bg-heritage-light p-6">
        <svg
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="mx-auto generational-tree-svg"
          style={{ backgroundColor: '#FDFBF7' }}
        >
          {/* Generation labels */}
          {['Generation 1 (Ancestors)', 'Generation 2', 'Generation 3', 'Generation 4'].map((label, idx) => (
            <text
              key={`gen-label-${idx}`}
              x="20"
              y={VERT_OFFSET + idx * GEN_SPACING + 15}
              fontSize="12"
              fill="#6B7280"
              fontWeight="600"
              opacity="0.7"
            >
              {label}
            </text>
          ))}

          {/* Render connectors first (so they appear behind nodes) */}
          {renderConnectors()}
          {renderCoupleConnectors()}

          {/* Render nodes */}
          {renderNodes()}
        </svg>
      </div>

      {/* Info panel for selected node */}
      {selectedNode && (
        <div className="border-t border-gray-200 p-6 bg-gray-50 generational-tree-info print:hidden">
          <div className="max-w-2xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-heritage-dark">{selectedNode.full_name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedNode.gender === 'Male' ? 'Musajja (Male)' : 'Mukazi (Female)'} • {selectedNode.clan_name || 'Clan Unknown'}
                </p>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-gray-500 hover:text-gray-700 font-bold text-xl"
              >
                ✕
              </button>
            </div>

            {selectedNode.bio && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 font-semibold mb-1">Oral History</p>
                <p className="text-gray-700 italic">{selectedNode.bio}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              {selectedNode.date_of_birth && (
                <div>
                  <p className="text-gray-600 font-semibold">Date of Birth</p>
                  <p className="text-gray-700">{selectedNode.date_of_birth}</p>
                </div>
              )}
              {selectedNode.date_of_death && (
                <div>
                  <p className="text-gray-600 font-semibold">Date of Death</p>
                  <p className="text-gray-700">{selectedNode.date_of_death}</p>
                </div>
              )}
              {selectedNode.occupation && (
                <div>
                  <p className="text-gray-600 font-semibold">Occupation</p>
                  <p className="text-gray-700">{selectedNode.occupation}</p>
                </div>
              )}
              {selectedNode.residence && (
                <div>
                  <p className="text-gray-600 font-semibold">Residence</p>
                  <p className="text-gray-700">{selectedNode.residence}</p>
                </div>
              )}
              {selectedNode.alternative_name && (
                <div>
                  <p className="text-gray-600 font-semibold">Alternative Name</p>
                  <p className="text-gray-700">{selectedNode.alternative_name}</p>
                </div>
              )}
              {selectedNode.father_id && (
                <div>
                  <p className="text-gray-600 font-semibold">Father</p>
                  <p className="text-gray-700">
                    {individuals.find(p => p.id === selectedNode.father_id)?.full_name || 'Unknown'}
                  </p>
                </div>
              )}
              {selectedNode.mother_id && (
                <div>
                  <p className="text-gray-600 font-semibold">Mother</p>
                  <p className="text-gray-700">
                    {individuals.find(p => p.id === selectedNode.mother_id)?.full_name || 'Unknown'}
                  </p>
                </div>
              )}
              {selectedNode.spouse_id && (
                <div>
                  <p className="text-gray-600 font-semibold">Spouse</p>
                  <p className="text-gray-700">
                    {individuals.find(p => p.id === selectedNode.spouse_id)?.full_name || 'Unknown'}
                  </p>
                </div>
              )}
              <div>
                <p className="text-gray-600 font-semibold">Total Children</p>
                <p className="text-gray-700">
                  {individuals.filter(p => p.father_id === selectedNode.id || p.mother_id === selectedNode.id).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="border-t border-gray-200 p-4 bg-white flex flex-wrap gap-6 justify-center text-sm print:hidden">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-500"></div>
          <span className="text-gray-700">Male</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-pink-500"></div>
          <span className="text-gray-700">Female</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-12 h-0.5 bg-yellow-500"></div>
          <span className="text-gray-700">Couple Bond</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-12 h-0.5 bg-gray-400"></div>
          <span className="text-gray-700">Parent-Child</span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .generational-tree-header { display: none !important; }
          .generational-tree-info { display: none !important; }
          .generational-tree-legend { display: none !important; }
          .generational-tree-svg { width: 100%; height: auto; }
          .generational-tree-container { background: white !important; }
        }
      `}} />
    </div>
  );
};

export default GenerationalFamilyTree;
