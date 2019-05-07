import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ViewService {

    viewUrl: string = `${environment.baseUrl}/view`;

    constructor(private _http: HttpClient) { }

    getViews = () => {
        return this._http.get(this.viewUrl);
    }

    createViews(view) {
        let input: object = {
            CreateViewRequest: view
        };
        return this._http.post(this.viewUrl, input);
    }

    deleteView = (ids: string[]) => {
        let input: object = {
            DeleteViewRequest: ids
        }
        return this._http.post(`${this.viewUrl}/delete`, input);
    }
}
