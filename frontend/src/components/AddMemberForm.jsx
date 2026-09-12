import { useState, useEffect } from 'react';
import { useHeritage } from '../context/HeritageContext';

const EMPTY_FORM = {
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
};

export default function AddMemberForm({ member = null, onClose, onSuccess }) {
  const { api, individuals, clans, canCreateRecord, canEditRecord } = useHeritage();
  const isEdit = Boolean(member?.id);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = isEdit ? canEditRecord() : canCreateRecord();

  useEffect(() => {
    if (member) {
      setForm({
        full_name: member.full_name || '',
        gender: member.gender || 'Male',
        clan_id: member.clan_id || '',
        father_id: member.father_id || '',
        mother_id: member.mother_id || '',
        bio: member.bio || '',
        date_of_birth: member.date_of_birth ? member.date_of_birth.split('T')[0] : '',
        date_of_death: member.date_of_death ? member.date_of_death.split('T')[0] : '',
        spouse_id: member.spouse_id || '',
        occupation: member.occupation || '',
        residence: member.residence || '',
        alternative_name: member.alternative_name || ''
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [member]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...form, [name]: value };

    if (name === 'father_id' && value) {
      const father = individuals.find((p) => p.id === Number(value));
      if (father?.clan_id) {
        next.clan_id = father.clan_id;
      }
    }

    setForm(next);
  };

  const buildPayload = () => ({
    full_name: form.full_name,
    gender: form.gender,
    clan_id: form.clan_id || null,
    father_id: form.father_id || null,
    mother_id: form.mother_id || null,
    bio: form.bio || null,
    date_of_birth: form.date_of_birth || null,
    date_of_death: form.date_of_death || null,
    spouse_id: form.spouse_id || null,
    occupation: form.occupation || null,
    residence: form.residence || null,
    alternative_name: form.alternative_name || null
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setError('');
    setLoading(true);

    try {
      const payload = buildPayload();
      if (isEdit) {
        await api.put(`/api/individuals/${member.id}`, payload);
      } else {
        await api.post('/api/individuals', payload);
      }
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save member');
    } finally {
      setLoading(false);
    }
  };

  const parentOptions = individuals.filter((p) => !member || p.id !== member.id);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-heritage-dark">{isEdit ? 'Edit Member' : 'Add New Member'}</h2>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-gray-600">Full Name *</span>
            <input name="full_name" value={form.full_name} onChange={handleChange} className="w-full mt-1 p-2 border rounded" required />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Alternative Name</span>
            <input name="alternative_name" value={form.alternative_name} onChange={handleChange} className="w-full mt-1 p-2 border rounded" />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Gender *</span>
            <select name="gender" value={form.gender} onChange={handleChange} className="w-full mt-1 p-2 border rounded">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Clan</span>
            <select name="clan_id" value={form.clan_id} onChange={handleChange} className="w-full mt-1 p-2 border rounded">
              <option value="">Select clan</option>
              {clans.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Father</span>
            <select name="father_id" value={form.father_id} onChange={handleChange} className="w-full mt-1 p-2 border rounded">
              <option value="">None</option>
              {parentOptions.filter((p) => p.gender === 'Male').map((p) => (
                <option key={p.id} value={p.id}>{p.full_name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Mother</span>
            <select name="mother_id" value={form.mother_id} onChange={handleChange} className="w-full mt-1 p-2 border rounded">
              <option value="">None</option>
              {parentOptions.filter((p) => p.gender === 'Female').map((p) => (
                <option key={p.id} value={p.id}>{p.full_name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Spouse</span>
            <select name="spouse_id" value={form.spouse_id} onChange={handleChange} className="w-full mt-1 p-2 border rounded">
              <option value="">None</option>
              {parentOptions.map((p) => (
                <option key={p.id} value={p.id}>{p.full_name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Date of Birth</span>
            <input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} className="w-full mt-1 p-2 border rounded" />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Date of Death</span>
            <input type="date" name="date_of_death" value={form.date_of_death} onChange={handleChange} className="w-full mt-1 p-2 border rounded" />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Occupation</span>
            <input name="occupation" value={form.occupation} onChange={handleChange} className="w-full mt-1 p-2 border rounded" />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Residence</span>
            <input name="residence" value={form.residence} onChange={handleChange} className="w-full mt-1 p-2 border rounded" />
          </label>
        </div>

        <label className="block mt-4">
          <span className="text-sm text-gray-600">Bio</span>
          <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} className="w-full mt-1 p-2 border rounded" />
        </label>

        <div className="flex gap-3 mt-6">
          {canSubmit && (
            <button type="submit" disabled={loading} className="bg-heritage-gold text-white px-6 py-2 rounded font-semibold disabled:opacity-50">
              {loading ? 'Saving...' : isEdit ? 'Update Member' : 'Add Member'}
            </button>
          )}
          <button type="button" onClick={onClose} className="px-6 py-2 border rounded">Cancel</button>
        </div>
      </form>
    </div>
  );
}
