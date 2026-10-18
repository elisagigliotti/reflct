import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

interface MediaUploadResponse {
  url: string;
}

/** Client verso com.reflct.api.media: upload foto (body-scan, try-on) -> URL pubblico. */
@Injectable({ providedIn: 'root' })
export class MediaService {
  private readonly http = inject(HttpClient);

  uploadImage(blob: Blob, filename = 'photo.jpg'): Observable<string> {
    const formData = new FormData();
    formData.append('file', blob, filename);
    return this.http
      .post<MediaUploadResponse>(`${environment.apiUrl}/media/images`, formData)
      .pipe(map((res) => res.url));
  }
}
