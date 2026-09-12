import { resolvePhotoUrl } from '../utils/photoUtils';

export default function PersonPhoto({ src, alt = '', className = '', onError, ...props }) {
  const resolved = resolvePhotoUrl(src);
  if (!resolved) return null;

  return (
    <img
      src={resolved}
      alt={alt}
      className={className}
      onError={onError || ((e) => { e.target.style.display = 'none'; })}
      {...props}
    />
  );
}
