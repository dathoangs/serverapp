import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from "@angular/common/http";
import {catchError, Observable, tap, throwError} from "rxjs";
import {CustomResponse} from "../interface/custom-response";
import {Server} from "../interface/server";
import {Status} from "../enum/status.enum";
import {TokenStorageService} from "./token-storage.service";

@Injectable({
  providedIn: 'root'
})
export class ServerService {

  constructor(private http: HttpClient) { }

  private readonly apiUrl = 'http://localhost:8080';

  servers$ = <Observable<CustomResponse>>
    this.http.get<CustomResponse>(`${this.apiUrl}/server/list`)
    .pipe(
      tap(console.log),
      catchError(this.handleError)
    );

  save$ = (server: Server) => <Observable<CustomResponse>>
    this.http.post<CustomResponse>(`${this.apiUrl}/server/save`, server)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  update$ = (server: Server, id: Number) => <Observable<CustomResponse>>
    this.http.post<CustomResponse>(`${this.apiUrl}/server/update/${id}`, server)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  ping$ = (ipAddress: String) => <Observable<CustomResponse>>
    this.http.get<CustomResponse>(`${this.apiUrl}/server/ping/${ipAddress}`)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  filter$ = (status: Status, response: CustomResponse) => <Observable<CustomResponse>>
    new Observable<CustomResponse>(
      subscriber => {
        console.log(response);
        subscriber.next(
          status === Status.ALL ? { ...response, message: `Servers filtered by ${status} status`}:{
            ...response,
            message: response.data.servers
            .filter(server => server.status === status).length > 0 ? `Servers filtered by
            ${status ===  Status.SERVER_UP ? 'SERVER UP' : 'SERVER DOWN'} status`
              : 'No server of ${status} found',
            data: { servers: response.data.servers.filter(server => server.status === status) }
          }
        );
        subscriber.complete();
      }
    )
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  delete$ = (serverId: Number) => <Observable<CustomResponse>>
    this.http.delete<CustomResponse>(`${this.apiUrl}/server/delete/${serverId}`)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  private handleError(handleError: HttpErrorResponse): Observable<never> {
    console.log(handleError);
    if (handleError.status == 403){
      return throwError(() => `Bạn không đủ quyền hạn để thực hiện chức năng này`);
    } else {
      return throwError(() => `Không ổn rồi - Check console - ErrorCode: ${handleError.status}`);
    }
  }

  print$ = () => <Observable<CustomResponse>>
    this.http.get<CustomResponse>(`${this.apiUrl}/server/report`)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );


}
