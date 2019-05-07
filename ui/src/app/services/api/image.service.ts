import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ImageService {

    imageUrl: string = `${environment.baseUrl}/image`;

    constructor(private _http: HttpClient) { }

    getImage = (source) => {
        return this._http.get(`${this.imageUrl}?bucketname=${source.bucketName}&&srcfilename=${source.srcFilename}`);
    }
}
