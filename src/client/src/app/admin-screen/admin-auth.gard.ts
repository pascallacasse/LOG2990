import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { HttpClient, HttpResponse, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class AdminAuthGard implements CanActivate {
    private static ADDRESS = 'http://localhost:3000';
    private static AUTHENTICATION_PATH = '/admin/authentication/';

    constructor(private http: HttpClient) { }

    public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        const headers: HttpHeaders = new HttpHeaders();
        headers.set('Origin', AdminAuthGard.ADDRESS);
        return this.http.get(AdminAuthGard.ADDRESS + AdminAuthGard.AUTHENTICATION_PATH, {
            observe: 'response',
            withCredentials: true,
            headers
        })
            .toPromise().then((response: HttpResponse<Object>) => response.ok)
            .catch((reason: HttpErrorResponse) => reason.status >= 200 && reason.status < 400).catch(() => false)
            .then((isConnected) => {
                if (!isConnected) {
                    const password = window.prompt('You have to be logged in to have access to this page') || '';
                    return this.http.post(AdminAuthGard.ADDRESS + AdminAuthGard.AUTHENTICATION_PATH + password,
                        null, { observe: 'response', withCredentials: true, headers })
                        .toPromise().then((response: HttpResponse<Object>) => response.ok)
                        .catch((reason: HttpErrorResponse) => reason.status >= 200 && reason.status < 400)
                        .catch(() => false);
                }
                return isConnected;
            }).catch((reason) => { console.warn(reason); return false; });
    }
}