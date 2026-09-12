import { useRef, useState } from 'react';
import { useHeritage } from '../context/HeritageContext';
import PersonPhoto from './PersonPhoto';

const MAX_MB = 5;

export default function PhotoUploadField({ value, onChange, disabled = false }) {
  const { api } = useHeritage();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (JPEG, PNG, WebP, or GIF).');
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Image must be ${MAX_MB}MB or smaller.`);
      return;
    }

    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('photo', file);
      const { data } = await api.post('/api/uploads/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onChange(data.photo_url || data.url || '');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload photo.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-4">
        {value ? (
          <PersonPhoto
            src={value}
            alt="Preview"
            className="w-20 h-20 rounded-full object-cover border-2 border-heritage-gold"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-heritage-cream border-2 border-dashed border-heritage-gold/50 flex items-center justify-center text-xs text-gray-500 text-center px-2">
            No photo
          </div>
        )}

        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFile}
            disabled={disabled || uploading}
            className="text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:bg-heritage-gold file:text-heritage-dark file:font-semibold file:cursor-pointer disabled:opacity-50"
          />
          {value && !disabled && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-sm text-red-600 hover:underline text-left"
            >
              Remove photo
            </button>
          )}
        </div>
      </div>

      {uploading && <p className="text-sm text-gray-500">Uploading photo...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <details className="text-sm">
        <summary className="text-gray-500 cursor-pointer hover:text-heritage-gold">Or paste an image URL</summary>
        <input
          type="url"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          disabled={disabled || uploading}
          className="w-full mt-2 p-2 border rounded text-sm"
        />
      </details>

      <p className="text-xs text-gray-500">
        Upload a portrait from your device (max {MAX_MB}MB). Shown on heritage tree nodes.
      </p>
    </div>
  );
}
