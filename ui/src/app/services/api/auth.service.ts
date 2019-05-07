import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { User } from '../../models/user';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    authUrl:string = `${environment.baseUrl}/authorize`;

    constructor(private _http: HttpClient) { }

    authorize = (user: User) => {
        let userCredentials:object = {
            LoginRequest: user
        }
        return this._http.post(this.authUrl, userCredentials);
    }
}
