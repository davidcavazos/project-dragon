import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

import { AuthHelperService } from '../helper/auth-helper.service';
import { LoaderService } from '../helper/loader.service'

@Injectable({
    providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor {

    private totalRequests = 0;

    constructor(private _authHelper: AuthHelperService, private loadingService: LoaderService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this.totalRequests++;
        this.loadingService.show();
        var endpoint = req.url.split('/');
        var authString
        switch (endpoint[(endpoint.length - 1)]) {
            case 'authorize':
                authString = null;
                break;
            default:
                authString = this._authHelper.getToken();
                break;
        }

        return next.handle(this.addHeaders(req, authString))
            .pipe(
                tap(res => {
                    if (res instanceof HttpResponse) {
                        this.decreaseRequests();
                    }
                }),
                catchError(err => {
                    this.decreaseRequests();
                    throw err;
                })
            );
    }

    addHeaders(req: HttpRequest<any>, token: string): HttpRequest<any> {
        var headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
        return req.clone({ setHeaders: headers })
    }

    private decreaseRequests() {
        this.totalRequests--;
        if (this.totalRequests === 0) {
            this.loadingService.hide();
        }
    }
}