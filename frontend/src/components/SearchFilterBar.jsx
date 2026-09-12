import { useState, useEffect } from 'react';

export default function SearchFilterBar({ individuals, onFilter }) {
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('');

  useEffect(() => {
    let filtered = individuals;

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((p) =>
        p.full_name?.toLowerCase().includes(q) ||
        p.alternative_name?.toLowerCase().includes(q) ||
        p.occupation?.toLowerCase().includes(q)
      );
    }

    if (gender) {
      filtered = filtered.filter((p) => p.gender === gender);
    }

    onFilter(filtered);
  }, [search, gender, individuals, onFilter]);

  return (
    <div className="flex flex-wrap gap-3">
      <input
        type="text"
        placeholder="Search by name, occupation..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="p-2 border rounded min-w-[200px]"
      />
      <select value={gender} onChange={(e) => setGender(e.target.value)} className="p-2 border rounded">
        <option value="">All genders</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>
    </div>
  );
}
