import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../services/api/auth.service';
import { AuthHelperService } from '../../services/helper/auth-helper.service';
import { User } from '../../models/user';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    user: User = {
        username: 'admin',
        password: 'admin'
    };

    constructor(private _auth: AuthService, private _authHelper: AuthHelperService, private _router: Router) { }

    ngOnInit() {

    }

    login = () => {
        this._auth.authorize(this.user).subscribe(res => {
            if(res['LoginResponse']['status'] !== "success"){
                alert(res['LoginResponse']['status']);
                return false;
            }

            this._authHelper.setToken(res['LoginResponse']['token']);
            this._router.navigate(['dashboard']);
        });
    }

}
