import { createClient } from "@/lib/supabase-server";

// Storage bucket names
export const STORAGE_BUCKETS = {
  GAMES_IMAGES: 'games-images',
  MUSIC_FILES: 'music-files',
  PODCAST_FILES: 'podcast-files',
} as const;

// Allowed file types
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/m4a'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  IMAGE: 10 * 1024 * 1024, // 10MB
  AUDIO: 50 * 1024 * 1024, // 50MB
  VIDEO: 100 * 1024 * 1024, // 100MB
} as const;

/**
 * Upload a file to Supabase storage
 */
export async function uploadFile(
  bucket: string,
  filePath: string,
  file: File,
  options?: {
    upsert?: boolean;
    contentType?: string;
  }
) {
  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      upsert: options?.upsert ?? false,
      contentType: options?.contentType ?? file.type,
    });

  if (error) {
    console.error('[Storage] Upload error:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return {
    path: data.path,
    publicUrl,
  };
}

/**
 * Upload a game image (thumbnail, banner, or screenshot)
 */
export async function uploadGameImage(
  type: 'thumbnail' | 'banner' | 'screenshot',
  gameId: string,
  file: File
) {
  // Validate file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Nieobsługiwany typ pliku obrazu. Dozwolone: JPEG, PNG, WebP, GIF');
  }

  // Validate file size
  if (file.size > FILE_SIZE_LIMITS.IMAGE) {
    throw new Error('Plik obrazu jest za duży. Maksymalny rozmiar: 10MB');
  }

  const timestamp = Date.now();
  const extension = file.name.split('.').pop();
  const filePath = `games/${gameId}/${type}-${timestamp}.${extension}`;

  return uploadFile(STORAGE_BUCKETS.GAMES_IMAGES, filePath, file);
}

/**
 * Upload a music file
 */
export async function uploadMusicFile(
  musicId: string,
  file: File,
  type: 'audio' | 'cover'
) {
  if (type === 'audio') {
    // Validate audio file
    if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
      throw new Error('Nieobsługiwany typ pliku audio. Dozwolone: MP3, WAV, OGG, FLAC, M4A');
    }

    if (file.size > FILE_SIZE_LIMITS.AUDIO) {
      throw new Error('Plik audio jest za duży. Maksymalny rozmiar: 50MB');
    }

    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filePath = `music/${musicId}/audio-${timestamp}.${extension}`;

    return uploadFile(STORAGE_BUCKETS.MUSIC_FILES, filePath, file);
  } else {
    // Validate cover image
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error('Nieobsługiwany typ pliku obrazu. Dozwolone: JPEG, PNG, WebP, GIF');
    }

    if (file.size > FILE_SIZE_LIMITS.IMAGE) {
      throw new Error('Plik obrazu jest za duży. Maksymalny rozmiar: 10MB');
    }

    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filePath = `music/${musicId}/cover-${timestamp}.${extension}`;

    return uploadFile(STORAGE_BUCKETS.MUSIC_FILES, filePath, file);
  }
}

/**
 * Upload a podcast file
 */
export async function uploadPodcastFile(
  podcastId: string,
  file: File,
  type: 'audio' | 'thumbnail'
) {
  if (type === 'audio') {
    // Validate audio file
    if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
      throw new Error('Nieobsługiwany typ pliku audio. Dozwolone: MP3, WAV, OGG, FLAC, M4A');
    }

    if (file.size > FILE_SIZE_LIMITS.AUDIO) {
      throw new Error('Plik audio jest za duży. Maksymalny rozmiar: 50MB');
    }

    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filePath = `podcasts/${podcastId}/audio-${timestamp}.${extension}`;

    return uploadFile(STORAGE_BUCKETS.PODCAST_FILES, filePath, file);
  } else {
    // Validate thumbnail image
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error('Nieobsługiwany typ pliku obrazu. Dozwolone: JPEG, PNG, WebP, GIF');
    }

    if (file.size > FILE_SIZE_LIMITS.IMAGE) {
      throw new Error('Plik obrazu jest za duży. Maksymalny rozmiar: 10MB');
    }

    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filePath = `podcasts/${podcastId}/thumbnail-${timestamp}.${extension}`;

    return uploadFile(STORAGE_BUCKETS.PODCAST_FILES, filePath, file);
  }
}

/**
 * Delete a file from Supabase storage
 */
export async function deleteFile(bucket: string, filePath: string) {
  const supabase = await createClient();

  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);

  if (error) {
    console.error('[Storage] Delete error:', error);
    throw new Error(`Delete failed: ${error.message}`);
  }

  return true;
}

/**
 * Get a public URL for a file
 */
export async function getPublicUrl(bucket: string, filePath: string) {
  const supabase = await createClient();

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

/**
 * Validate file before upload
 */
export function validateFile(file: File, type: 'image' | 'audio' | 'video') {
  const allowedTypes = type === 'image' ? ALLOWED_IMAGE_TYPES :
                      type === 'audio' ? ALLOWED_AUDIO_TYPES :
                      ALLOWED_VIDEO_TYPES;

  const sizeLimit = type === 'image' ? FILE_SIZE_LIMITS.IMAGE :
                   type === 'audio' ? FILE_SIZE_LIMITS.AUDIO :
                   FILE_SIZE_LIMITS.VIDEO;

  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Nieobsługiwany typ pliku. Dozwolone: ${allowedTypes.join(', ')}`);
  }

  if (file.size > sizeLimit) {
    const sizeMB = (sizeLimit / (1024 * 1024)).toFixed(0);
    throw new Error(`Plik jest za duży. Maksymalny rozmiar: ${sizeMB}MB`);
  }

  return true;
}
