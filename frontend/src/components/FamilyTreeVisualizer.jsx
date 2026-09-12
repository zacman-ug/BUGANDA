import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useHeritage } from '../context/HeritageContext';
import { getTotemIcon, getClanColor, LUGANDA, LIFE_EVENT_META } from '../utils/heritageUtils';
import PersonPhoto from './PersonPhoto';

function TotemNodeLabel({ individual }) {
  const icon = getTotemIcon(individual.clan_totem, individual.clan_name);
  const borderColor = getClanColor(individual.clan_id, individual.clan_name);
  const events = [];
  if (individual.date_of_birth) events.push(LIFE_EVENT_META.birth);
  if (individual.date_of_death) events.push(LIFE_EVENT_META.death);
  if (individual.spouse_id) events.push(LIFE_EVENT_META.marriage);

  return (
    <div className="text-center py-1 px-1">
      {individual.photo_url ? (
        <PersonPhoto
          src={individual.photo_url}
          alt={individual.full_name}
          className="w-10 h-10 mx-auto rounded-full object-cover border-2 mb-1"
          style={{ borderColor }}
        />
      ) : (
        <div className="w-10 h-10 mx-auto mb-1 rounded-full bg-heritage-cream flex items-center justify-center text-xs font-bold text-heritage-dark border-2" style={{ borderColor }}>
          {icon}
        </div>
      )}
      <div className="font-bold text-xs leading-tight">{individual.full_name.substring(0, 22)}</div>
      <div className="text-[10px] opacity-90 mt-0.5">{individual.clan_name || LUGANDA.clan}</div>
      {individual.clan_totem && (
        <div className="text-[9px] opacity-75">{individual.clan_totem}</div>
      )}
      {events.length > 0 && (
        <div className="flex justify-center gap-0.5 mt-1">
          {events.map((e) => (
            <span key={e.label} title={e.label} className={`text-[9px] px-1 rounded border ${e.color}`}>{e.label}</span>
          ))}
        </div>
      )}
    </div>
  );
}

const FamilyTreeVisualizer = ({ clanFilter = null, individuals: providedIndividuals = null, embedded = false }) => {
  const { api } = useHeritage();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    const fetchTreeData = async () => {
      try {
        setLoading(true);
        let roots = [];
        let allIndividuals = [];

        if (providedIndividuals && providedIndividuals.length > 0) {
          allIndividuals = providedIndividuals;
          const individualsMap = new Map();
          allIndividuals.forEach((individual) => {
            individualsMap.set(individual.id, { ...individual, children: [] });
          });

          individualsMap.forEach((person) => {
            if (person.father_id && individualsMap.has(person.father_id)) {
              individualsMap.get(person.father_id).children.push(person);
            }
            if (person.mother_id && individualsMap.has(person.mother_id)) {
              individualsMap.get(person.mother_id).children.push(person);
            }
            if (!person.father_id && !person.mother_id) {
              roots.push(person);
            }
          });

          if (roots.length === 0) {
            roots = Array.from(individualsMap.values());
          }
        } else {
          const { data: treeData } = await api.get('/api/family-tree');
          roots = treeData.roots;
          allIndividuals = treeData.allIndividuals;
        }

        const filteredIndividuals = clanFilter
          ? allIndividuals.filter((ind) => ind.clan_id === clanFilter)
          : allIndividuals;

        const newNodes = [];
        const newEdges = [];
        const createdNodeIds = new Set();
        const createdEdgeIds = new Set();
        let yOffset = 0;

        const processIndividual = (individual, x = 0, y = yOffset, generation = 0) => {
          const nodeId = `node-${individual.id}`;
          const isNewNode = !createdNodeIds.has(nodeId);
          yOffset += 100;

          if (isNewNode) {
            const borderColor = getClanColor(individual.clan_id, individual.clan_name);
            const bgColor = individual.gender === 'Male' ? '#2C1810' : '#4A2C2A';

            newNodes.push({
              id: nodeId,
              data: {
                label: <TotemNodeLabel individual={individual} />,
                individual,
              },
              position: { x: x + generation * 250, y },
              style: {
                background: bgColor,
                color: 'white',
                border: `3px solid ${borderColor}`,
                borderRadius: '12px',
                padding: '8px 6px',
                width: '170px',
                fontSize: '12px',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
              },
            });
            createdNodeIds.add(nodeId);
          }

          if (individual.children && individual.children.length > 0) {
            individual.children.forEach((child, index) => {
              const edgeId = `edge-${individual.id}-${child.id}`;

              if (!createdEdgeIds.has(edgeId)) {
                newEdges.push({
                  id: edgeId,
                  source: nodeId,
                  target: `node-${child.id}`,
                  markerEnd: { type: MarkerType.ArrowClosed, color: '#C4A035' },
                  style: { stroke: '#C4A035', strokeWidth: 2.5, opacity: 0.85 },
                });
                createdEdgeIds.add(edgeId);
              }

              if (!createdNodeIds.has(`node-${child.id}`)) {
                const childX = x + (index - individual.children.length / 2) * 200;
                processIndividual(child, childX, yOffset, generation + 1);
              }
            });
          }
        };

        const rootsToProcess = clanFilter
          ? roots.filter((r) => r.clan_id === clanFilter)
          : roots;

        rootsToProcess.forEach((root, index) => {
          processIndividual(root, index * 400, 0, 0);
        });

        if (newNodes.length === 0 && clanFilter && filteredIndividuals.length > 0) {
          filteredIndividuals.forEach((individual, index) => {
            processIndividual(individual, index * 300, 0, 0);
          });
        }

        setNodes(newNodes);
        setEdges(newEdges);
        setError(null);
      } catch (err) {
        console.error('Error fetching family tree:', err);
        setError('Failed to load heritage tree. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTreeData();
  }, [clanFilter, providedIndividuals, setNodes, setEdges, api]);

  const handleNodeClick = useCallback((event, node) => {
    setSelectedNode(node.data.individual);
    try {
      window.dispatchEvent(new CustomEvent('member:selected', { detail: node.data.individual.id }));
    } catch (e) {
      // ignore
    }
  }, []);

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 rounded-lg ${embedded ? 'h-full' : 'h-96'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-heritage-gold mx-auto mb-4" />
          <p className="text-gray-600">Loading heritage tree...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 rounded-lg ${embedded ? 'h-full' : 'h-96'}`}>
        <p className="text-gray-600">Add ancestors to begin your heritage tree.</p>
      </div>
    );
  }

  const containerClass = embedded
    ? 'flex h-full gap-4'
    : 'flex h-screen gap-4 bg-gray-100';

  return (
    <div className={containerClass}>
      <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          fitView
        >
          <Background color="#aaa" gap={16} />
          <Controls style={{ bottom: '20px', right: '20px' }} />
        </ReactFlow>
      </div>

      {selectedNode && !embedded && (
        <div className="w-80 bg-white rounded-lg shadow-lg p-6 border-t-4 border-heritage-gold">
          {selectedNode.photo_url && (
            <PersonPhoto
              src={selectedNode.photo_url}
              alt={selectedNode.full_name}
              className="w-20 h-20 rounded-full object-cover border-2 border-heritage-gold mx-auto mb-3"
            />
          )}
          <h3 className="text-xl font-bold text-gray-800 mb-4">{selectedNode.full_name}</h3>

          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-600 font-semibold">{LUGANDA.clan}</p>
              <p className="text-gray-800">{selectedNode.clan_name || '—'}</p>
              {selectedNode.clan_totem && (
                <p className="text-xs text-heritage-gold">{selectedNode.clan_totem}</p>
              )}
            </div>

            <div>
              <p className="text-gray-600 font-semibold">Gender</p>
              <p className="text-gray-800">
                {selectedNode.gender === 'Male' ? 'Musajja (Male)' : 'Mukazi (Female)'}
              </p>
            </div>

            {selectedNode.bio && (
              <div>
                <p className="text-gray-600 font-semibold">{LUGANDA.oralHistory}</p>
                <p className="text-gray-800 italic">{selectedNode.bio}</p>
              </div>
            )}

            {selectedNode.father_id && (
              <div className="pt-3 border-t">
                <p className="text-gray-600 font-semibold">{LUGANDA.father}</p>
                <p className="text-gray-800">Linked in lineage</p>
              </div>
            )}

            {selectedNode.mother_id && (
              <div>
                <p className="text-gray-600 font-semibold">{LUGANDA.mother}</p>
                <p className="text-gray-800">Linked in lineage</p>
              </div>
            )}

            {selectedNode.spouse_id && (
              <div>
                <p className="text-gray-600 font-semibold">{LUGANDA.marriage}</p>
                <p className="text-gray-800">{LUGANDA.spouse} linked</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setSelectedNode(null)}
            className="mt-6 w-full bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded transition"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default FamilyTreeVisualizer;
