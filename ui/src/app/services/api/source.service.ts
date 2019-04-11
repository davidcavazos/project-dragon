import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SourceService {

    sourceUrl: string = `${environment.baseUrl}/source`;

    constructor(private _http: HttpClient) { }

    getSources = () => {
        return this._http.get(this.sourceUrl);
    }

    addSource = (param) => {
        let input = {
            CreateSourceRequest: param
        };
        return this._http.post(this.sourceUrl, input);
    }

    deleteSource = (id: string) => {
        return this._http.delete(`${this.sourceUrl}/${id}`);
    }
}
