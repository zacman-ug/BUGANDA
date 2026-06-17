import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { HeritageContext } from '../context/HeritageContext';
import { useToast } from './Toast';

const AddMemberForm = ({ editingMember, onCancel }) => {
  const { fetchHeritageData, individuals, canCreateRecord } = useContext(HeritageContext);
  const { show: showToast, ToastContainer } = useToast();

  const [clans, setClans] = useState([]);
  const [formData, setFormData] = useState({
    full_name: '',
    gender: 'Male',
    clan_id: '',
    father_id: '',
    mother_id: '',
    bio: '',
    date_of_birth: '',
    date_of_death: '',
    spouse_id: '',
    occupation: '',
    residence: '',
    alternative_name: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [autoFatherClan, setAutoFatherClan] = useState(false);
  const [showSpouseModal, setShowSpouseModal] = useState(false);
  const [spouseFormData, setSpouseFormData] = useState({
    full_name: '',
    gender: 'Female',
    clan_id: ''
  });
  const [spouseErrors, setSpouseErrors] = useState({});
  const [spouseIsLoading, setSpouseIsLoading] = useState(false);

  useEffect(() => {
    const fetchClans = async () => {
      try {
        const response = await axios.get('/api/clans');
        setClans(response.data);
      } catch (err) {
        console.error("Could not load clans", err);
        showToast('Could not load clans', 'error');
      }
    };
    fetchClans();
  }, [showToast]);

  // Prefill form when editingMember is provided
  useEffect(() => {
    if (editingMember) {
      setFormData({
        full_name: editingMember.full_name || '',
        gender: editingMember.gender || 'Male',
        clan_id: editingMember.clan_id ? String(editingMember.clan_id) : '',
        father_id: editingMember.father_id ? String(editingMember.father_id) : '',
        mother_id: editingMember.mother_id ? String(editingMember.mother_id) : '',
        bio: editingMember.bio || '',
        date_of_birth: editingMember.date_of_birth || '',
        date_of_death: editingMember.date_of_death || '',
        spouse_id: editingMember.spouse_id ? String(editingMember.spouse_id) : '',
        occupation: editingMember.occupation || '',
        residence: editingMember.residence || '',
        alternative_name: editingMember.alternative_name || ''
      });
    }
  }, [editingMember]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = 'Name must be at least 2 characters';
    }

    if (!formData.clan_id) {
      newErrors.clan_id = 'Clan selection is required';
    }

    if (formData.date_of_birth && formData.date_of_death) {
      if (new Date(formData.date_of_birth) > new Date(formData.date_of_death)) {
        newErrors.date_of_death = 'Death date cannot be before birth date';
      }
    }

    if (formData.date_of_birth) {
      if (new Date(formData.date_of_birth) > new Date()) {
        newErrors.date_of_birth = 'Birth date cannot be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSpouseForm = () => {
    const newErrors = {};

    if (!spouseFormData.full_name.trim()) {
      newErrors.full_name = 'Spouse name is required';
    } else if (spouseFormData.full_name.trim().length < 2) {
      newErrors.full_name = 'Name must be at least 2 characters';
    }

    if (!spouseFormData.clan_id) {
      newErrors.clan_id = 'Clan is required';
    }

    setSpouseErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddSpouse = async (e) => {
    e.preventDefault();
    
    if (!validateSpouseForm()) {
      showToast('Please fill in all required spouse fields', 'error');
      return;
    }

    setSpouseIsLoading(true);
    try {
      const response = await axios.post('/api/individuals', {
        ...spouseFormData,
        bio: '',
        father_id: '',
        mother_id: '',
        spouse_id: ''
      });

      const newSpouse = response.data;
      
      // Update main form with new spouse ID
      setFormData({...formData, spouse_id: newSpouse.id.toString()});
      
      // Refresh data
      await fetchHeritageData();
      
      showToast(`✓ Spouse ${spouseFormData.full_name} added successfully!`, 'success');
      
      // Reset spouse form
      setSpouseFormData({
        full_name: '',
        gender: 'Female',
        clan_id: ''
      });
      setSpouseErrors({});
      setShowSpouseModal(false);
    } catch (err) {
      console.error('Error:', err);
      showToast(err.response?.data?.error || 'Error adding spouse. Please try again.', 'error');
    } finally {
      setSpouseIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canCreateRecord()) {
      showToast('⚠️ You do not have permission to add records', 'error');
      return;
    }

    if (!validateForm()) {
      showToast('Please fix the errors below', 'error');
      return;
    }

    setIsLoading(true);
    try {
      if (editingMember) {
        await axios.put(`/api/individuals/${editingMember.id}`, formData);
        await fetchHeritageData();
        showToast('✓ Member updated successfully!', 'success');
        if (onCancel) onCancel();
      } else {
        await axios.post('/api/individuals', formData);
        await fetchHeritageData();
        showToast('✓ Ancestral record preserved successfully!', 'success');

        setFormData({
          full_name: '',
          gender: 'Male',
          clan_id: '',
          father_id: '',
          mother_id: '',
          bio: '',
          date_of_birth: '',
          date_of_death: '',
          spouse_id: '',
          occupation: '',
          residence: '',
          alternative_name: ''
        });
        setErrors({});
      }
    } catch (err) {
      console.error('Error:', err);
      showToast('Error saving record. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="max-w-3xl mx-auto animate-slide-up">
      <ToastContainer />
      <div className="bg-gradient-to-br from-white via-heritage-light to-heritage-cream p-8 rounded-2xl shadow-heritage-lg border-2 border-heritage-gold/30 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-heritage-gold opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-heritage-gold opacity-5 rounded-full blur-3xl"></div>
        
        {/* Header */}
        <div className="relative z-10 mb-8 border-b-2 border-heritage-gold/30 pb-6">
          <h2 className="text-3xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-r from-heritage-dark to-heritage-gold mb-2">
            📜 Register Lineage Member
          </h2>
          <p className="text-gray-600 italic font-serif">Preserving the "Abaana ba Kintu" stories for future generations</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {/* Full Name Section */}
          <div className="group">
            <label className="block text-sm font-bold text-heritage-dark mb-2 font-serif">
              Full Name (Erinnya Lijjuvu) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input 
                type="text" 
                className={`w-full border-2 rounded-xl p-4 focus:ring-2 focus:ring-heritage-gold outline-none transition-all duration-200 bg-white ${
                  errors.full_name ? 'border-red-500' : 'border-heritage-gold/30 hover:border-heritage-gold/50'
                } focus:border-heritage-gold`}
                value={formData.full_name}
                onChange={(e) => {
                  setFormData({...formData, full_name: e.target.value});
                  if (errors.full_name) setErrors({...errors, full_name: ''});
                }}
                placeholder="Enter full name..."
              />
              <span className="absolute right-4 top-4 text-heritage-gold opacity-50">👤</span>
            </div>
            {errors.full_name && <p className="text-red-500 text-sm mt-1">⚠ {errors.full_name}</p>}
          </div>

          {/* Gender & Clan Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="group">
              <label className="block text-sm font-bold text-heritage-dark mb-2 font-serif">Gender</label>
              <select 
                className="w-full border-2 border-heritage-gold/30 rounded-xl p-4 bg-white focus:ring-2 focus:ring-heritage-gold focus:border-heritage-gold outline-none transition-all hover:border-heritage-gold/50"
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
              >
                <option value="Male">♂ Male (Musajja)</option>
                <option value="Female">♀ Female (Mukazi)</option>
              </select>
            </div>
            
            <div className="group">
              <label className="block text-sm font-bold text-heritage-dark mb-2 font-serif">
                Clan (Omuziro) <span className="text-red-500">*</span>
              </label>
              <select 
                className={`w-full border-2 rounded-xl p-4 bg-white focus:ring-2 focus:ring-heritage-gold outline-none transition-all ${
                  errors.clan_id ? 'border-red-500' : 'border-heritage-gold/30 hover:border-heritage-gold/50'
                } focus:border-heritage-gold`}
                value={formData.clan_id}
                onChange={(e) => {
                  setFormData({...formData, clan_id: e.target.value});
                  if (errors.clan_id) setErrors({...errors, clan_id: ''});
                }}
              >
                <option value="">🏛️ Select Clan...</option>
                {clans.map(clan => (
                  <option key={clan.id} value={clan.id}>{clan.display_name || clan.name}</option>
                ))}
              </select>
              {errors.clan_id && <p className="text-red-500 text-sm mt-1">⚠ {errors.clan_id}</p>}
            </div>
          </div>

          {/* Lineage Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200/50 space-y-4">
            <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider font-serif">👨‍👩‍👧 Family Lineage</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Father (Kitaawe) - Optional</label>
                <select 
                  className="w-full border-2 border-blue-200/50 rounded-xl p-3 bg-white focus:ring-2 focus:ring-blue-400 outline-none transition-all"
                  value={formData.father_id}
                  onChange={(e) => {
                    const fatherId = e.target.value;
                    const father = individuals.find(p => p.id == fatherId);
                    if (father) {
                      setFormData({...formData, father_id: fatherId, clan_id: father.clan_id.toString()});
                      setAutoFatherClan(true);
                    } else {
                      setFormData({...formData, father_id: fatherId});
                      setAutoFatherClan(false);
                    }
                  }}
                >
                  <option value="">Select Father...</option>
                  {individuals
                    .filter(p => p.gender === 'Male')
                    .map(person => (
                      <option key={person.id} value={person.id}>
                        {person.full_name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Mother (Nnyina) - Optional</label>
                <select 
                  className="w-full border-2 border-blue-200/50 rounded-xl p-3 bg-white focus:ring-2 focus:ring-blue-400 outline-none transition-all"
                  value={formData.mother_id}
                  onChange={(e) => setFormData({...formData, mother_id: e.target.value})}
                >
                  <option value="">Select Mother...</option>
                  {individuals
                    .filter(p => p.gender === 'Female')
                    .map(person => (
                      <option key={person.id} value={person.id}>
                        {person.full_name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Dates Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="group">
              <label className="block text-sm font-bold text-heritage-dark mb-2 font-serif">📅 Date of Birth (Optional)</label>
              <input 
                type="date" 
                className={`w-full border-2 rounded-xl p-4 focus:ring-2 focus:ring-heritage-gold outline-none transition-all bg-white ${
                  errors.date_of_birth ? 'border-red-500' : 'border-heritage-gold/30 hover:border-heritage-gold/50'
                } focus:border-heritage-gold`}
                value={formData.date_of_birth}
                onChange={(e) => {
                  setFormData({...formData, date_of_birth: e.target.value});
                  if (errors.date_of_birth) setErrors({...errors, date_of_birth: ''});
                }}
              />
              {errors.date_of_birth && <p className="text-red-500 text-sm mt-1">⚠ {errors.date_of_birth}</p>}
            </div>

            <div className="group">
              <label className="block text-sm font-bold text-heritage-dark mb-2 font-serif">📅 Date of Death (Optional)</label>
              <input 
                type="date" 
                className={`w-full border-2 rounded-xl p-4 focus:ring-2 focus:ring-heritage-gold outline-none transition-all bg-white ${
                  errors.date_of_death ? 'border-red-500' : 'border-heritage-gold/30 hover:border-heritage-gold/50'
                } focus:border-heritage-gold`}
                value={formData.date_of_death}
                onChange={(e) => {
                  setFormData({...formData, date_of_death: e.target.value});
                  if (errors.date_of_death) setErrors({...errors, date_of_death: ''});
                }}
              />
              {errors.date_of_death && <p className="text-red-500 text-sm mt-1">⚠ {errors.date_of_death}</p>}
            </div>
          </div>

          {/* Spouse Section */}
          <div className="group">
            <label className="block text-sm font-bold text-heritage-dark mb-2 font-serif">💑 Link as Spouse (Optional)</label>
            <p className="text-xs text-gray-600 mb-2 italic">Select someone from a different family to link as spouse. Children will inherit father's clan.</p>
            <div className="flex gap-2">
              <select 
                className="flex-1 border-2 border-heritage-gold/30 rounded-xl p-4 focus:ring-2 focus:ring-heritage-gold focus:border-heritage-gold outline-none transition-all bg-white hover:border-heritage-gold/50"
                value={formData.spouse_id}
                onChange={(e) => setFormData({...formData, spouse_id: e.target.value})}
              >
                <option value="">No spouse linked</option>
                {individuals.map(person => (
                  <option key={person.id} value={person.id}>
                    {person.full_name} ({person.gender}) - {person.clan_name}
                  </option>
              ))}
            </select>
              <button
                type="button"
                onClick={() => setShowSpouseModal(true)}
                className="px-4 py-4 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-bold rounded-xl transition-all hover:shadow-lg whitespace-nowrap"
              >
                + Add New
              </button>
            </div>
          </div>

          <div className="group">
            <label className="block text-sm font-bold text-heritage-dark mb-2 font-serif">👔 Occupation/Role (Optional)</label>
            <input 
              type="text" 
              className="w-full border-2 border-heritage-gold/30 rounded-xl p-4 focus:ring-2 focus:ring-heritage-gold focus:border-heritage-gold outline-none transition-all bg-white hover:border-heritage-gold/50"
              value={formData.occupation}
              onChange={(e) => setFormData({...formData, occupation: e.target.value})}
              placeholder="e.g., Kabaka, Sezeekali, Farmer..."
            />
          </div>

          {/* Location & Names Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="group">
              <label className="block text-sm font-bold text-heritage-dark mb-2 font-serif">📍 Residence/Location (Optional)</label>
              <input 
                type="text" 
                className="w-full border-2 border-heritage-gold/30 rounded-xl p-4 focus:ring-2 focus:ring-heritage-gold focus:border-heritage-gold outline-none transition-all bg-white hover:border-heritage-gold/50"
                value={formData.residence}
                onChange={(e) => setFormData({...formData, residence: e.target.value})}
                placeholder="Village, County, or Region..."
              />
            </div>

            <div className="group">
              <label className="block text-sm font-bold text-heritage-dark mb-2 font-serif">✨ Alternative Name (Optional)</label>
              <input 
                type="text" 
                className="w-full border-2 border-heritage-gold/30 rounded-xl p-4 focus:ring-2 focus:ring-heritage-gold focus:border-heritage-gold outline-none transition-all bg-white hover:border-heritage-gold/50"
                value={formData.alternative_name}
                onChange={(e) => setFormData({...formData, alternative_name: e.target.value})}
                placeholder="Nickname, Clan Name, or Praise Name..."
              />
            </div>
          </div>

          {/* Oral History Section */}
          <div className="group">
            <label className="block text-sm font-bold text-heritage-dark mb-2 font-serif">📖 Brief Oral History</label>
            <textarea 
              className="w-full border-2 border-heritage-gold/30 rounded-xl p-4 focus:ring-2 focus:ring-heritage-gold focus:border-heritage-gold outline-none transition-all bg-white hover:border-heritage-gold/50 resize-none"
              rows="4"
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              placeholder="Share the story, lineage, or notable achievements..."
            ></textarea>
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={isLoading}
            className={`w-full relative overflow-hidden text-heritage-dark font-bold text-lg py-4 rounded-xl transition-all duration-300 group/btn ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-heritage-gold via-yellow-400 to-heritage-bronze hover:shadow-heritage-lg before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-gradient-to-r before:from-heritage-dark before:to-black before:translate-y-full hover:before:translate-y-0 before:transition-transform before:duration-300'
            }`}
          >
            <span className="relative z-10 group-hover/btn:text-heritage-gold transition-colors duration-300 flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Saving...
                </>
              ) : (
                <>
                  <span>✓</span>
                  Preserve to Archives
                </>
              )}
            </span>
          </button>
        </form>

        {/* Spouse Modal */}
        {showSpouseModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-up">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-heritage-dark font-serif">💑 Add New Spouse</h3>
                <button
                  onClick={() => {
                    setShowSpouseModal(false);
                    setSpouseFormData({ full_name: '', gender: 'Female', clan_id: '' });
                    setSpouseErrors({});
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddSpouse} className="space-y-4">
                {/* Spouse Name */}
                <div className="group">
                  <label className="block text-sm font-bold text-heritage-dark mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`w-full border-2 rounded-xl p-3 focus:ring-2 focus:ring-heritage-gold outline-none transition-all bg-white ${
                      spouseErrors.full_name ? 'border-red-500' : 'border-heritage-gold/30 hover:border-heritage-gold/50'
                    } focus:border-heritage-gold`}
                    value={spouseFormData.full_name}
                    onChange={(e) => {
                      setSpouseFormData({...spouseFormData, full_name: e.target.value});
                      if (spouseErrors.full_name) setSpouseErrors({...spouseErrors, full_name: ''});
                    }}
                    placeholder="Spouse's full name..."
                  />
                  {spouseErrors.full_name && <p className="text-red-500 text-sm mt-1">⚠ {spouseErrors.full_name}</p>}
                </div>

                {/* Spouse Gender */}
                <div className="group">
                  <label className="block text-sm font-bold text-heritage-dark mb-2">Gender</label>
                  <select
                    className="w-full border-2 border-heritage-gold/30 rounded-xl p-3 bg-white focus:ring-2 focus:ring-heritage-gold focus:border-heritage-gold outline-none transition-all"
                    value={spouseFormData.gender}
                    onChange={(e) => setSpouseFormData({...spouseFormData, gender: e.target.value})}
                  >
                    <option value="Female">♀ Female</option>
                    <option value="Male">♂ Male</option>
                  </select>
                </div>

                {/* Spouse Clan */}
                <div className="group">
                  <label className="block text-sm font-bold text-heritage-dark mb-2">
                    Clan <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={`w-full border-2 rounded-xl p-3 bg-white focus:ring-2 focus:ring-heritage-gold outline-none transition-all ${
                      spouseErrors.clan_id ? 'border-red-500' : 'border-heritage-gold/30 hover:border-heritage-gold/50'
                    } focus:border-heritage-gold`}
                    value={spouseFormData.clan_id}
                    onChange={(e) => {
                      setSpouseFormData({...spouseFormData, clan_id: e.target.value});
                      if (spouseErrors.clan_id) setSpouseErrors({...spouseErrors, clan_id: ''});
                    }}
                  >
                    <option value="">🏛️ Select Clan...</option>
                    {clans.map(clan => (
                      <option key={clan.id} value={clan.id}>{clan.display_name || clan.name}</option>
                    ))}
                  </select>
                  {spouseErrors.clan_id && <p className="text-red-500 text-sm mt-1">⚠ {spouseErrors.clan_id}</p>}
                </div>

                {/* Modal Actions */}
                <div className="flex gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSpouseModal(false);
                      setSpouseFormData({ full_name: '', gender: 'Female', clan_id: '' });
                      setSpouseErrors({});
                    }}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={spouseIsLoading}
                    className={`flex-1 px-4 py-2 rounded-xl text-white font-bold transition-all ${
                      spouseIsLoading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 hover:shadow-lg'
                    }`}
                  >
                    {spouseIsLoading ? '⏳ Adding...' : '✓ Add & Link'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
    </div>
  );
};

export default AddMemberForm;