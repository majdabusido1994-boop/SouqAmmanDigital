// Resolves image paths to full URLs
// Local storage returns paths like /uploads/filename.jpg
// Cloudinary returns full https:// URLs

const API_BASE = __DEV__
  ? 'http://192.168.100.236:5000'
  : 'https://your-production-server.com';

export function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path}`;
}
