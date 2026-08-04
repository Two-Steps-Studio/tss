import { createClient, createServiceClient } from "@/lib/supabase-server";
import { STORAGE_BUCKETS, ALLOWED_DEV_FILE_EXTENSIONS, FILE_SIZE_LIMITS } from "./storage-constants";

// Re-export for convenience
export { ALLOWED_DEV_FILE_EXTENSIONS, FILE_SIZE_LIMITS };

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
  const client = createServiceClient();

  const { data, error } = await client.storage
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
  const { data: { publicUrl } } = client.storage
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
  const supabase = createServiceClient();

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
  const supabase = createServiceClient();

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

/**
 * Validate dev file extension
 */
export function validateDevFileExtension(fileName: string): boolean {
  const extension = '.' + fileName.split('.').pop()?.toLowerCase();
  return ALLOWED_DEV_FILE_EXTENSIONS.includes(extension);
}

/**
 * Upload a dev project file
 */
export async function uploadDevFile(
  projectId: number,
  file: File,
  userId: string
) {
  // Validate file extension
  if (!validateDevFileExtension(file.name)) {
    throw new Error(`Nieobsługiwane rozszerzenie pliku. Dozwolone: ${ALLOWED_DEV_FILE_EXTENSIONS.join(', ')}`);
  }

  // Validate file size
  if (file.size > FILE_SIZE_LIMITS.DEV_FILE) {
    throw new Error(`Plik jest za duży. Maksymalny rozmiar: 10MB`);
  }

  const timestamp = Date.now();
  const extension = file.name.split('.').pop();
  const filePath = `projects/${projectId}/${userId}/${timestamp}.${extension}`;

  return uploadFile(STORAGE_BUCKETS.DEV_FILES, filePath, file);
}

/**
 * Get project storage usage
 */
export async function getProjectStorageUsage(projectId: number): Promise<number> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('dev_project_files')
    .select('size_bytes')
    .eq('project_id', projectId);

  if (error) {
    console.error('[Storage] Error fetching project storage:', error);
    return 0;
  }

  const totalBytes = data?.reduce((sum, file) => sum + (file.size_bytes || 0), 0) || 0;
  return totalBytes;
}
