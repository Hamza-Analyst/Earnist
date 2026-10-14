import type { LocalProfile } from './models';
export const profileFields = [
  { key: 'photoDataUrl', label: 'Profile photo' },
  { key: 'displayName', label: 'Display name' },
  { key: 'email', label: 'Contact email' },
  { key: 'phone', label: 'Phone number' },
  { key: 'businessName', label: 'Business name' },
  { key: 'businessDescription', label: 'Business activity' },
  { key: 'workType', label: 'How you earn' },
  { key: 'businessLocation', label: 'Business location' },
  { key: 'businessWebsite', label: 'Website or portfolio' },
] as const;
export function profileCompletion(profile: LocalProfile) {
  const missing = profileFields.filter(field => {
    const value = String(profile[field.key] ?? '').trim();
    if (!value) return true;
    if (field.key === 'email') return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (field.key === 'businessWebsite') { try { return !['http:', 'https:'].includes(new URL(value).protocol); } catch { return true; } }
    return false;
  });
  return { score: Math.round((profileFields.length - missing.length) / profileFields.length * 100), completed: profileFields.length - missing.length, total: profileFields.length, missing };
}
