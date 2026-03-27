// Resolves image paths to full URLs
// Local storage returns paths like /uploads/filename.jpg
// Cloudinary returns full https:// URLs

import { API_BASE } from '../config';

export function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path}`;
}
