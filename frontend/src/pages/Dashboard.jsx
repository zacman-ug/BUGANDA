import { useState, useEffect } from 'react';

import { Link, useSearchParams } from 'react-router-dom';

import { useHeritage } from '../context/HeritageContext';

import GenerationalFamilyTree from '../components/GenerationalFamilyTree';

import AddMemberForm from '../components/AddMemberForm';

import MemberDetailsPanel from '../components/MemberDetailsPanel';

import SearchFilterBar from '../components/SearchFilterBar';

import AdvancedSearch from '../components/AdvancedSearch';

import DataExportPanel from '../components/DataExportPanel';

import HeritageCompleteness from '../components/heritage/HeritageCompleteness';

import { useToast } from '../components/Toast';



export default function Dashboard() {

  const { user, individuals, loading, logout, canCreateRecord, canExportData, fetchIndividuals } = useHeritage();

  const { show: showToast, ToastContainer } = useToast();

  const [searchParams] = useSearchParams();

  const [filteredIndividuals, setFilteredIndividuals] = useState([]);

  const [selectedMember, setSelectedMember] = useState(null);

  const [showAddForm, setShowAddForm] = useState(false);

  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  const [showExportPanel, setShowExportPanel] = useState(false);

  const [editingMember, setEditingMember] = useState(null);



  useEffect(() => {

    setFilteredIndividuals(individuals);

  }, [individuals]);



  useEffect(() => {

    if (searchParams.get('view') === 'add' && canCreateRecord()) {

      setShowAddForm(true);

    }

  }, [searchParams, canCreateRecord]);



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

    showToast(editingMember ? 'Member updated successfully' : 'Member added successfully', 'success');

  };



  const handleDelete = () => {

    setSelectedMember(null);

    fetchIndividuals();

    showToast('Member deleted', 'success');

  };



  return (

    <div className="min-h-screen bg-heritage-cream">

      <ToastContainer />

      <header className="bg-heritage-dark text-white p-4 flex flex-wrap justify-between items-center gap-3">

        <div>

          <Link to="/" className="text-xl font-bold hover:text-heritage-gold transition">Buganda Heritage</Link>

          <p className="text-sm text-gray-300">Welcome, {user?.full_name}</p>

        </div>

        <div className="flex flex-wrap gap-3 items-center text-sm">

          <Link to="/" className="text-heritage-gold hover:underline">Home</Link>

          <Link to="/heritage" className="text-heritage-gold hover:underline">Heritage Experience</Link>
          <Link to="/family-tree" className="text-heritage-gold hover:underline">Family Tree</Link>

          <Link to="/clans" className="text-heritage-gold hover:underline">Clans</Link>

          <Link to="/profile" className="text-heritage-gold hover:underline">Profile</Link>

          {user?.role === 'admin' && (

            <Link to="/admin" className="text-heritage-gold hover:underline">Admin</Link>

          )}

          <button onClick={logout} className="text-red-300 hover:text-red-200">Logout</button>

        </div>

      </header>



      <div className="p-4 max-w-7xl mx-auto space-y-6">

        <HeritageCompleteness />



        <div className="flex flex-wrap gap-3 items-center justify-between">

          <SearchFilterBar individuals={individuals} onFilter={setFilteredIndividuals} />

          <div className="flex flex-wrap gap-2">

            <button

              onClick={() => setShowAdvancedSearch(true)}

              className="px-4 py-2 border border-heritage-gold text-heritage-dark rounded font-semibold hover:bg-heritage-gold/10"

            >

              Advanced Search

            </button>

            {canExportData() && (

              <button

                onClick={() => setShowExportPanel(true)}

                className="px-4 py-2 border border-gray-400 text-gray-700 rounded font-semibold hover:bg-gray-100"

              >

                Share Heritage

              </button>

            )}

            {canCreateRecord() && (

              <button

                onClick={() => { setEditingMember(null); setShowAddForm(true); }}

                className="bg-heritage-gold text-white px-4 py-2 rounded font-semibold hover:opacity-90"

              >

                Add to Lineage

              </button>

            )}

          </div>

        </div>



        {loading ? (

          <p className="text-center text-gray-500 py-12">Loading your lineage...</p>

        ) : filteredIndividuals.length === 0 ? (

          <p className="text-center text-gray-500 py-12">No lineage yet. Add your first ancestor to begin preserving your heritage.</p>

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



      {showAdvancedSearch && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">

            <div className="flex justify-between items-center mb-4">

              <h2 className="text-xl font-bold text-heritage-dark">Advanced Search</h2>

              <button onClick={() => setShowAdvancedSearch(false)} className="text-gray-500 text-sm font-semibold">Close</button>

            </div>

            <AdvancedSearch

              onResults={(results) => {

                setFilteredIndividuals(results);

                setShowAdvancedSearch(false);

                showToast(`Found ${results.length} matching members`, 'success');

              }}

            />

          </div>

        </div>

      )}



      {showExportPanel && (

        <DataExportPanel onClose={() => setShowExportPanel(false)} />

      )}



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

