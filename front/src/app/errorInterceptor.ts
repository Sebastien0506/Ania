import { HttpClient, HttpEvent, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { catchError, Observable, throwError } from "rxjs";
import { Router } from "@angular/router";
import { inject } from "@angular/core";
import { NavBarService } from "./nav-bar/nav-bar.service";


export function channelInterceptor(
    
    req: HttpRequest<unknown>,
    next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
    console.log(req.url);
    const router = inject(Router);
    const navBarService = inject(NavBarService);
    const http = inject(HttpClient);
    return next(req).pipe(
        
        catchError(
            (err) => {
                if(err.status === 404){
                   router.navigate(['/page404']);
                }

                if(err.status === 401){
                    navBarService.isLogged.set(false);
                    
                    if(!req.url.includes('/api/logout')) {
                        http.post('/api/logout/', {}, {
                            withCredentials: true
                        }).subscribe({
                            error: (err) => console.error("Erreur logout :", err)
                        });
                    }
                    router.navigate(['/page401']);
                }

                if(err.status === 403) {
                    router.navigate(['/page403']);
                }

                if(err.status === 500) {
                    router.navigate(['/page500']);
                }
                return throwError(() => err);
            }

        )
    )
}