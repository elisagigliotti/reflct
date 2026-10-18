// Upload di foto scattate con la fotocamera verso com.reflct.api.media,
// che le salva e restituisce un URL pubblico consumabile da ai-service
// (body-scan) o mostrato in UI (try-on).
import { uploadMultipart } from './client';

interface MediaUploadResponse {
  url: string;
}

function guessMimeAndName(uri: string): { type: string; name: string } {
  const ext = uri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const type = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
  return { type, name: `photo.${ext === 'jpg' || ext === 'jpeg' ? 'jpg' : ext}` };
}

export async function uploadImage(localUri: string): Promise<string> {
  const { type, name } = guessMimeAndName(localUri);
  const formData = new FormData();
  // React Native fetch accetta questa forma { uri, name, type } al posto di un Blob.
  formData.append('file', { uri: localUri, name, type } as unknown as Blob);

  const res = await uploadMultipart<MediaUploadResponse>('/media/images', formData);
  return res.url;
}
