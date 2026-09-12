import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useHeritage } from '../context/HeritageContext';
import GenerationalFamilyTree from '../components/GenerationalFamilyTree';
import AddMemberForm from '../components/AddMemberForm';
import MemberDetailsPanel from '../components/MemberDetailsPanel';
import SearchFilterBar from '../components/SearchFilterBar';

export default function Dashboard() {
  const { user, individuals, loading, logout, canCreateRecord, fetchIndividuals } = useHeritage();
  const [filteredIndividuals, setFilteredIndividuals] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  useEffect(() => {
    setFilteredIndividuals(individuals);
  }, [individuals]);

  const handleEdit = (member) => {
    setEditingMember(member);
    setShowAddForm(true);
    setSelectedMember(null);
  };

  const handleFormClose = () => {
    setShowAddForm(false);
    setEditingMember(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    fetchIndividuals();
  };

  const handleDelete = () => {
    setSelectedMember(null);
    fetchIndividuals();
  };

  return (
    <div className="min-h-screen bg-heritage-cream">
      <header className="bg-heritage-dark text-white p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Buganda Heritage</h1>
          <p className="text-sm text-gray-300">Welcome, {user?.full_name}</p>
        </div>
        <div className="flex gap-4 items-center">
          {user?.role === 'admin' && (
            <Link to="/admin" className="text-heritage-gold text-sm">Admin</Link>
          )}
          <button onClick={logout} className="text-sm text-red-300 hover:text-red-200">Logout</button>
        </div>
      </header>

      <div className="p-4 max-w-7xl mx-auto">
        <div className="flex flex-wrap gap-4 mb-4 items-center justify-between">
          <SearchFilterBar individuals={individuals} onFilter={setFilteredIndividuals} />
          {canCreateRecord() && (
            <button
              onClick={() => { setEditingMember(null); setShowAddForm(true); }}
              className="bg-heritage-gold text-white px-4 py-2 rounded font-semibold hover:opacity-90"
            >
              Add Member
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-12">Loading records...</p>
        ) : filteredIndividuals.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No family records yet. Add your first member to begin.</p>
        ) : (
          <div
            onClick={(e) => {
              const node = e.target.closest('[data-member-id]');
              if (node) {
                const memberId = parseInt(node.getAttribute('data-member-id'), 10);
                const member = individuals.find((p) => p.id === memberId);
                if (member) setSelectedMember(member);
              }
            }}
          >
            <GenerationalFamilyTree individuals={filteredIndividuals} />
          </div>
        )}
      </div>

      {showAddForm && (
        <AddMemberForm
          member={editingMember}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {selectedMember && (
        <MemberDetailsPanel
          member={selectedMember}
          individuals={individuals}
          onClose={() => setSelectedMember(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
