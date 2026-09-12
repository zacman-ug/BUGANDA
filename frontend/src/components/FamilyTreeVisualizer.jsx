import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import axios from 'axios';

/**
 * FamilyTreeVisualizer Component
 * Purpose: Displays a hierarchical family tree using React Flow
 */
const FamilyTreeVisualizer = ({ clanFilter = null, individuals: providedIndividuals = null }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  // Fetch family tree data and convert to React Flow format
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
          const response = await axios.get('/api/family-tree');
          const treeData = response.data;
          roots = treeData.roots;
          allIndividuals = treeData.allIndividuals;
        }

        const filteredIndividuals = clanFilter
          ? allIndividuals.filter(ind => ind.clan_id === clanFilter)
          : allIndividuals;

        const newNodes = [];
        const newEdges = [];
        const createdNodeIds = new Set();
        const createdEdgeIds = new Set();
        let yOffset = 0;

        // Helper function to recursively process individuals and create nodes/edges
        const processIndividual = (individual, x = 0, y = yOffset, generation = 0) => {
          const nodeId = `node-${individual.id}`;
          const isNewNode = !createdNodeIds.has(nodeId);
          yOffset += 100; // Increase spacing for each node

          if (isNewNode) {
            const nodeColor = individual.gender === 'Male' ? '#2563EB' : '#DB2777';
            const nodeLabel = individual.full_name.substring(0, 20);
            const genderSymbol = individual.gender === 'Male' ? '♂' : '♀';

            newNodes.push({
              id: nodeId,
              data: {
                label: (
                  <div className="text-center py-2">
                    <div className="text-2xl font-bold mb-2">{genderSymbol}</div>
                    <div className="font-bold text-sm leading-tight">{nodeLabel}</div>
                    <div className="text-xs opacity-85 mt-1 font-medium">{individual.clan_name || 'Unknown'}</div>
                  </div>
                ),
                individual,
              },
              position: { x: x + generation * 250, y },
              style: {
                background: nodeColor,
                color: 'white',
                border: '3px solid #FFD700',
                borderRadius: '12px',
                padding: '14px 10px',
                width: '170px',
                fontSize: '12px',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.3s ease',
                fontWeight: '600',
              },
            });
            createdNodeIds.add(nodeId);
          }

          // Create edges to children
          if (individual.children && individual.children.length > 0) {
            individual.children.forEach((child, index) => {
              const edgeId = `edge-${individual.id}-${child.id}`;

              if (!createdEdgeIds.has(edgeId)) {
                newEdges.push({
                  id: edgeId,
                  source: nodeId,
                  target: `node-${child.id}`,
                  markerEnd: { type: MarkerType.ArrowClosed, color: '#D4AF37' },
                  style: { stroke: '#D4AF37', strokeWidth: 2.5, opacity: 0.8 },
                  animated: false,
                  curvature: 0.5,
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

        // Start processing from root ancestors
        const rootsToProcess = clanFilter
          ? roots.filter(r => r.clan_id === clanFilter)
          : roots;

        rootsToProcess.forEach((root, index) => {
          processIndividual(root, index * 400, 0, 0);
        });

        // If no roots found but we have clan filter, process all individuals in that clan
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
        setError('Failed to load family tree. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTreeData();
  }, [clanFilter, providedIndividuals, setNodes, setEdges]);

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
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-heritage-gold mx-auto mb-4"></div>
          <p className="text-gray-600">Loading family tree...</p>
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
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <p className="text-gray-600">No family tree data available. Add members to get started!</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen gap-4 bg-gray-100">
      {/* React Flow Canvas */}
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

      {/* Details Panel */}
      {selectedNode && (
        <div className="w-80 bg-white rounded-lg shadow-lg p-6 border-t-4 border-heritage-gold">
          <h3 className="text-xl font-bold text-gray-800 mb-4">{selectedNode.full_name}</h3>

          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-600 font-semibold">Clan</p>
              <p className="text-gray-800">{selectedNode.clan_name || 'Unknown'}</p>
            </div>

            <div>
              <p className="text-gray-600 font-semibold">Gender</p>
              <p className="text-gray-800">
                {selectedNode.gender === 'Male' ? 'Musajja (Male)' : 'Mukazi (Female)'}
              </p>
            </div>

            {selectedNode.bio && (
              <div>
                <p className="text-gray-600 font-semibold">Oral History</p>
                <p className="text-gray-800 italic">{selectedNode.bio}</p>
              </div>
            )}

            {selectedNode.father_id && (
              <div className="pt-3 border-t">
                <p className="text-blue-600 font-semibold">Father ID: {selectedNode.father_id}</p>
              </div>
            )}

            {selectedNode.mother_id && (
              <div>
                <p className="text-pink-600 font-semibold">Mother ID: {selectedNode.mother_id}</p>
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
