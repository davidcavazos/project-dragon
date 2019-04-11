import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AuthHelperService {

    constructor() { }

    setToken = (token) => {
        return localStorage.setItem('token', token);
    }

    getToken = () => {
        return localStorage.getItem('token');
    }

    deleteToken = () => {
        return localStorage.removeItem('token');
    }

    clearData = () => {
        return localStorage.clear();
    }

}
