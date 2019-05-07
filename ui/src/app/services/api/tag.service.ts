import { Injectable, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { IBlock } from '../../models/block';

@Injectable({
    providedIn: 'root'
})
export class TagService {

    tagUrl: string = `${environment.baseUrl}/tag`;

    constructor(private _http: HttpClient) { }

    getTags = () => {
        return this._http.get(this.tagUrl);
    }

    search = (input) => {
        let param = {
            SearchTagRequest: input
        };
        return this._http.post(`${this.tagUrl}/search`, param);
    }

    createTags = (tags: IBlock[]) => {
        let input: object = {
            CreateTagRequest: tags
        }
        return this._http.post(this.tagUrl, input);
    }

    updateTage = (tags: any[]) => {
        let input = {
            UpdateTagRequest: tags
        };
        return this._http.put(this.tagUrl, input);
    }

    deleteTag = (ids: string[]) => {
        let input: object = {
            DeleteTagRequest: ids
        }
        return this._http.post(`${this.tagUrl}/delete`, input);
    }
}
