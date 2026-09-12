import { useState } from 'react';
import { useHeritage } from '../context/HeritageContext';

export default function MemberDetailsPanel({ member, individuals, onClose, onEdit, onDelete }) {
  const { api, canEditRecord, canDeleteRecord } = useHeritage();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [lineage, setLineage] = useState(null);
  const [loadingLineage, setLoadingLineage] = useState(false);

  const father = member.father_id ? individuals.find((p) => p.id === member.father_id) : null;
  const mother = member.mother_id ? individuals.find((p) => p.id === member.mother_id) : null;
  const spouse = member.spouse_id ? individuals.find((p) => p.id === member.spouse_id) : null;
  const children = individuals.filter((p) => p.father_id === member.id || p.mother_id === member.id);
  const siblings = individuals.filter(
    (p) => (p.father_id === father?.id || p.mother_id === mother?.id) && p.id !== member.id
  );

  const handleViewLineage = async () => {
    setLoadingLineage(true);
    setError('');
    try {
      const { data } = await api.get(`/api/individuals/${member.id}/lineage`);
      setLineage(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load lineage');
    } finally {
      setLoadingLineage(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      await api.delete(`/api/individuals/${member.id}`);
      onDelete?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete member');
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-heritage-dark">{member.full_name}</h2>
              {member.alternative_name && (
                <p className="text-gray-500 italic">aka {member.alternative_name}</p>
              )}
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
          </div>

          {error && <p className="text-red-600 mb-4">{error}</p>}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Gender</p>
                <p className="font-semibold text-heritage-dark">{member.gender}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Clan</p>
                <p className="font-semibold text-heritage-dark">{member.clan_name || 'N/A'}</p>
              </div>
              {member.date_of_birth && (
                <div>
                  <p className="text-gray-600 text-sm">Date of Birth</p>
                  <p className="font-semibold text-heritage-dark">{member.date_of_birth?.split('T')[0]}</p>
                </div>
              )}
              {member.date_of_death && (
                <div>
                  <p className="text-gray-600 text-sm">Date of Death</p>
                  <p className="font-semibold text-heritage-dark">{member.date_of_death?.split('T')[0]}</p>
                </div>
              )}
              {member.occupation && (
                <div>
                  <p className="text-gray-600 text-sm">Occupation</p>
                  <p className="font-semibold text-heritage-dark">{member.occupation}</p>
                </div>
              )}
              {member.residence && (
                <div>
                  <p className="text-gray-600 text-sm">Residence</p>
                  <p className="font-semibold text-heritage-dark">{member.residence}</p>
                </div>
              )}
              {spouse && (
                <div>
                  <p className="text-gray-600 text-sm">Spouse</p>
                  <p className="font-semibold text-heritage-dark">{spouse.full_name}</p>
                </div>
              )}
            </div>

            {member.bio && (
              <div>
                <p className="text-gray-600 text-sm">Bio</p>
                <p className="text-heritage-dark">{member.bio}</p>
              </div>
            )}

            {father && (
              <div>
                <p className="text-gray-600 text-sm">Father</p>
                <p className="font-semibold text-heritage-dark">{father.full_name}</p>
              </div>
            )}
            {mother && (
              <div>
                <p className="text-gray-600 text-sm">Mother</p>
                <p className="font-semibold text-heritage-dark">{mother.full_name}</p>
              </div>
            )}
            {children.length > 0 && (
              <div>
                <p className="text-gray-600 text-sm">Children ({children.length})</p>
                <ul className="list-disc list-inside">
                  {children.map((c) => <li key={c.id}>{c.full_name}</li>)}
                </ul>
              </div>
            )}
            {siblings.length > 0 && (
              <div>
                <p className="text-gray-600 text-sm">Siblings ({siblings.length})</p>
                <ul className="list-disc list-inside">
                  {siblings.map((s) => <li key={s.id}>{s.full_name}</li>)}
                </ul>
              </div>
            )}
          </div>

          {lineage && (
            <div className="mt-4 p-4 bg-purple-50 rounded border border-purple-200">
              <h3 className="font-bold text-heritage-dark mb-2">Lineage</h3>
              {lineage.parents.father && <p className="text-sm">Father: {lineage.parents.father.full_name}</p>}
              {lineage.parents.mother && <p className="text-sm">Mother: {lineage.parents.mother.full_name}</p>}
              {lineage.children.length > 0 && (
                <p className="text-sm mt-2">
                  Children: {lineage.children.map((c) => c.full_name).join(', ')}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t">
            <button
              onClick={handleViewLineage}
              disabled={loadingLineage}
              className="bg-purple-600 text-white px-4 py-2 rounded font-semibold disabled:opacity-50"
            >
              {loadingLineage ? 'Loading...' : 'View Lineage'}
            </button>
            {canEditRecord() && (
              <button
                onClick={() => onEdit(member)}
                className="bg-heritage-gold text-white px-4 py-2 rounded font-semibold"
              >
                Edit Member
              </button>
            )}
            {canDeleteRecord() && !confirmDelete && (
              <button
                onClick={() => setConfirmDelete(true)}
                className="bg-red-600 text-white px-4 py-2 rounded font-semibold"
              >
                Delete Member
              </button>
            )}
            {confirmDelete && (
              <div className="flex gap-2 items-center">
                <span className="text-sm text-red-600">Delete {member.full_name}?</span>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Confirm'}
                </button>
                <button onClick={() => setConfirmDelete(false)} className="px-3 py-1 border rounded text-sm">Cancel</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
