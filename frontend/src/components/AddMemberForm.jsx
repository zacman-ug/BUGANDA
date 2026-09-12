import { useState, useEffect } from 'react';

import { useHeritage } from '../context/HeritageContext';
import PhotoUploadField from './PhotoUploadField';



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

  alternative_name: '',

  photo_url: '',

  is_external: false

};



const EMPTY_INLINE_PARENT = {

  full_name: '',

  clan_id: '',

  bio: '',

  is_external: true

};



const ADD_NEW_FATHER = '__new_father__';

const ADD_NEW_MOTHER = '__new_mother__';



function InlineParentFields({ label, value, onChange, clans }) {

  return (

    <div className="md:col-span-2 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">

      <p className="text-sm font-semibold text-heritage-dark">

        {label} — from outside the family or not yet in your tree

      </p>

      <p className="text-xs text-gray-600">

        Use this when a parent comes from a different clan or lineage (e.g. mother is in your family, father is from outside).

      </p>

      <label className="block">

        <span className="text-sm text-gray-600">Full Name *</span>

        <input

          value={value.full_name}

          onChange={(e) => onChange({ ...value, full_name: e.target.value })}

          className="w-full mt-1 p-2 border rounded bg-white"

          required

        />

      </label>

      <label className="block">

        <span className="text-sm text-gray-600">Clan (omuziro)</span>

        <select

          value={value.clan_id}

          onChange={(e) => onChange({ ...value, clan_id: e.target.value })}

          className="w-full mt-1 p-2 border rounded bg-white"

        >

          <option value="">Select clan...</option>

          {clans.map((c) => (

            <option key={c.id} value={c.id}>

              {c.name}{c.totem ? ` — ${c.totem}` : ''}

            </option>

          ))}

        </select>

      </label>

      <label className="flex items-center gap-2 text-sm text-gray-700">

        <input

          type="checkbox"

          checked={value.is_external}

          onChange={(e) => onChange({ ...value, is_external: e.target.checked })}

        />

        From outside family / different lineage

      </label>

    </div>

  );

}



export default function AddMemberForm({ member = null, onClose, onSuccess }) {

  const { api, individuals, clans, canCreateRecord, canEditRecord } = useHeritage();

  const isEdit = Boolean(member?.id);

  const [form, setForm] = useState(EMPTY_FORM);

  const [fatherMode, setFatherMode] = useState('existing');

  const [motherMode, setMotherMode] = useState('existing');

  const [newFather, setNewFather] = useState(EMPTY_INLINE_PARENT);

  const [newMother, setNewMother] = useState(EMPTY_INLINE_PARENT);

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

        alternative_name: member.alternative_name || '',

        photo_url: member.photo_url || '',

        is_external: member.is_external || false

      });

      setFatherMode('existing');

      setMotherMode('existing');

    } else {

      setForm(EMPTY_FORM);

      setFatherMode('existing');

      setMotherMode('existing');

      setNewFather(EMPTY_INLINE_PARENT);

      setNewMother(EMPTY_INLINE_PARENT);

    }

  }, [member]);



  const handleChange = (e) => {

    const { name, value, type, checked } = e.target;

    const next = { ...form, [name]: type === 'checkbox' ? checked : value };



    if (name === 'father_id') {

      if (value === ADD_NEW_FATHER) {

        setFatherMode('new');

        next.father_id = '';

      } else {

        setFatherMode('existing');

        const father = individuals.find((p) => p.id === Number(value));

        if (father?.clan_id) {

          next.clan_id = father.clan_id;

        }

      }

    }



    if (name === 'mother_id') {

      if (value === ADD_NEW_MOTHER) {

        setMotherMode('new');

        next.mother_id = '';

      } else {

        setMotherMode('existing');

      }

    }



    setForm(next);

  };



  const buildPayload = () => {

    const payload = {

      full_name: form.full_name,

      gender: form.gender,

      clan_id: form.clan_id || null,

      father_id: fatherMode === 'existing' ? (form.father_id || null) : null,

      mother_id: motherMode === 'existing' ? (form.mother_id || null) : null,

      bio: form.bio || null,

      date_of_birth: form.date_of_birth || null,

      date_of_death: form.date_of_death || null,

      spouse_id: form.spouse_id || null,

      occupation: form.occupation || null,

      residence: form.residence || null,

      alternative_name: form.alternative_name || null,

      photo_url: form.photo_url || null,

      is_external: form.is_external || false

    };



    if (fatherMode === 'new') {

      payload.new_father = {

        full_name: newFather.full_name,

        clan_id: newFather.clan_id || null,

        bio: newFather.bio || null,

        is_external: newFather.is_external

      };

    }



    if (motherMode === 'new') {

      payload.new_mother = {

        full_name: newMother.full_name,

        clan_id: newMother.clan_id || null,

        bio: newMother.bio || null,

        is_external: newMother.is_external

      };

    }



    return payload;

  };



  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!canSubmit) return;



    if (fatherMode === 'new' && !newFather.full_name.trim()) {

      setError('Please enter the new father\'s name');

      return;

    }

    if (motherMode === 'new' && !newMother.full_name.trim()) {

      setError('Please enter the new mother\'s name');

      return;

    }



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

          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700 text-sm font-semibold">Close</button>

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

            </select>

          </label>

          <label className="block">

            <span className="text-sm text-gray-600">Clan (inherits from father)</span>

            <select name="clan_id" value={form.clan_id} onChange={handleChange} className="w-full mt-1 p-2 border rounded">

              <option value="">Select clan (omuziro)...</option>

              {clans.map((c) => (

                <option key={c.id} value={c.id}>

                  {c.name}{c.totem ? ` — ${c.totem}` : ''}

                </option>

              ))}

            </select>

          </label>



          <label className="block">

            <span className="text-sm text-gray-600">Father (Kitaawe)</span>

            <select

              name="father_id"

              value={fatherMode === 'new' ? ADD_NEW_FATHER : form.father_id}

              onChange={handleChange}

              className="w-full mt-1 p-2 border rounded"

            >

              <option value="">None</option>

              {parentOptions.filter((p) => p.gender === 'Male').map((p) => (

                <option key={p.id} value={p.id}>

                  {p.full_name}{p.is_external ? ' (outside family)' : ''}

                </option>

              ))}

              <option value={ADD_NEW_FATHER}>Add new father (outside / not in tree)</option>

            </select>

          </label>



          {fatherMode === 'new' && (

            <InlineParentFields

              label="New Father"

              value={newFather}

              onChange={setNewFather}

              clans={clans}

            />

          )}



          <label className="block">

            <span className="text-sm text-gray-600">Mother (Nnyina)</span>

            <select

              name="mother_id"

              value={motherMode === 'new' ? ADD_NEW_MOTHER : form.mother_id}

              onChange={handleChange}

              className="w-full mt-1 p-2 border rounded"

            >

              <option value="">None</option>

              {parentOptions.filter((p) => p.gender === 'Female').map((p) => (

                <option key={p.id} value={p.id}>

                  {p.full_name}{p.is_external ? ' (outside family)' : ''}

                </option>

              ))}

              <option value={ADD_NEW_MOTHER}>Add new mother (outside / not in tree)</option>

            </select>

          </label>



          {motherMode === 'new' && (

            <InlineParentFields

              label="New Mother"

              value={newMother}

              onChange={setNewMother}

              clans={clans}

            />

          )}



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



        <div className="mt-4 md:col-span-2">

          <span className="text-sm text-gray-600 block mb-2">Portrait photo</span>

          <PhotoUploadField
            value={form.photo_url}
            onChange={(photo_url) => setForm((prev) => ({ ...prev, photo_url }))}
            disabled={!canSubmit || loading}
          />

        </div>



        <label className="block mt-4">

          <span className="text-sm text-gray-600">Oral History (Ebyafaayo)</span>

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

