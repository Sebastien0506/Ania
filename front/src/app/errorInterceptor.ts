import { HttpEvent, HttpEventType, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { catchError, Observable, throwError } from "rxjs";
import { Router } from "@angular/router";
import { inject } from "@angular/core";

export function channelInterceptor(
    req: HttpRequest<unknown>,
    next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
    console.log(req.url);
    const router = inject(Router);
    return next(req).pipe(
        catchError(
            (err) => {
                if(err.status === 404){
                   router.navigate(['/page404'])
                }
                return throwError(() => err);
            }

        )
    )
}