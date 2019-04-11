import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthHelperService } from '../helper/auth-helper.service';

@Injectable({
    providedIn: 'root'
})
export class DashboardService implements CanActivate {

    constructor(private _authHelper: AuthHelperService, private _router: Router) { }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        if (this._authHelper.getToken()) {
            return true;
        }

        // navigate to login page
        this._router.navigate(['/login']);
        // you can save redirect url so after authing we can move them back to the page they requested
        return false;
    }
}
