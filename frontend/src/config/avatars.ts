// Single source of truth for all avatar presets
// These are static images stored in /public/avatars/

export const AVATAR_LIST: string[] = Array.from({ length: 27 }, (_, i) => `/avatars/avatar_${String(i + 1).padStart(2, '0')}.png`);

export const DEFAULT_AVATAR = AVATAR_LIST[0];
