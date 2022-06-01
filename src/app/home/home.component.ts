import {Component, OnInit} from '@angular/core';
import {ServerService} from "../service/server.service";
import {BehaviorSubject, catchError, map, Observable, of, startWith} from "rxjs";
import {AppState} from "../interface/app-state";
import {CustomResponse} from "../interface/custom-response";
import {DataState} from "../enum/data-state.enum";
import {Status} from "../enum/status.enum";
import {NgForm} from "@angular/forms";
import {Server} from "../interface/server";
import {FormsModule} from "@angular/forms";
import {AuthService} from "../service/auth.service";
import {TokenStorageService} from "../service/token-storage.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {
  //title = 'serverapp';
  appState$: Observable<AppState<CustomResponse>>;
  readonly DataState = DataState;
  readonly Status = Status;
  private filterSubject = new BehaviorSubject<String>('');
  private dataSubject = new BehaviorSubject<CustomResponse>(null);
  filterStatus$ = this.filterSubject.asObservable();
  private isLoading = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoading.asObservable();
  roles: string[] = [];
  admin: boolean;
  mod: boolean;
  user: boolean;
  serverUpd?: Server;

  constructor(private serverService: ServerService, private tokenStorage: TokenStorageService) {}

  ngOnInit(): void {
    if (this.tokenStorage.getToken()) {
      this.roles = this.tokenStorage.getUser().roles;
      this.user = this.mod = this.admin = false;

      if (this.roles.includes('ROLE_ADMIN')){
        this.admin = true;
      }
      if (this.roles.includes('ROLE_MODERATOR')){
        this.mod = true;
      }
      if (this.roles.includes('ROLE_USER')){
        this.user = true;
      }
    }

    this.appState$ = this.serverService.servers$
      .pipe(
        map(response => {
          this.dataSubject.next(response);
          return {dataState: DataState.LOADED_STATE,
            appData: {...response, data: {servers: response.data.servers.reverse()}}}
        }),
        startWith({dataState: DataState.LOADING_STATE}),
        catchError((error: String) => {
          return of({dataState: DataState.ERROR_STATE, error: error})
        })
      );
  }

  pingServer(ipAddress: String): void {
    this.filterSubject.next(ipAddress);
    this.appState$ = this.serverService.ping$(ipAddress)
      .pipe(
        map(response => {
          const index = this.dataSubject.value.data.servers.findIndex(
            server => server.id === response.data.server.id
          );
          this.dataSubject.value.data.servers[index] = response.data.server;
          this.filterSubject.next('');
          return {dataState: DataState.LOADED_STATE, appData: this.dataSubject.value}
        }),
        startWith({dataState: DataState.LOADED_STATE, appData: this.dataSubject.value}),
        catchError((error: String) => {
          this.filterSubject.next('');
          return of({dataState: DataState.ERROR_STATE, error: error})
        })
      );
  }

  filterServers(status: any): void {
    this.appState$ = this.serverService.filter$(status.target.value, this.dataSubject.value)
      .pipe(
        map(response => {
          return {dataState: DataState.LOADED_STATE, appData: response}
        }),
        startWith({dataState: DataState.LOADED_STATE, appData: this.dataSubject.value}),
        catchError((error: String) => {
          return of({dataState: DataState.ERROR_STATE, error: error})
        })
      );
  }

  saveServer(serverForm: NgForm): void {
    this.isLoading.next(true);
    this.appState$ = this.serverService.save$(<Server>serverForm.value)
      .pipe(
        map(response => {
          this.dataSubject.next(
            {...response, data: {servers: [response.data.server, ...this.dataSubject.value.data.servers]}}
          );
          document.getElementById('closeModal').click();
          this.isLoading.next(false);
          serverForm.resetForm({status: Status.SERVER_DOWN});
          return {dataState: DataState.LOADED_STATE, appData: this.dataSubject.value}
        }),
        startWith({dataState: DataState.LOADED_STATE, appData: this.dataSubject.value}),
        catchError((error: String) => {
          this.isLoading.next(false);
          return of({dataState: DataState.ERROR_STATE, error: error})
        })
      );
  }

  updateServer(serverForm: NgForm, id: number): void {
    this.isLoading.next(true);
    this.appState$ = this.serverService.update$(<Server>serverForm.value, id)
      .pipe(
        map(response => {
          this.dataSubject.next(
            {...response,
              data: {servers: [response.data.server, ...this.dataSubject.value.data.servers]}}
          );
          document.getElementById('closeModalupd').click();
          this.isLoading.next(false);
          serverForm.resetForm({status: Status.SERVER_DOWN});
          return {dataState: DataState.LOADING_STATE}
        }),
        startWith({dataState: DataState.LOADED_STATE, appData: this.dataSubject.value}),
        catchError((error: String) => {
          this.isLoading.next(false);
          return of({dataState: DataState.ERROR_STATE, error: error})
        })
      );
    this.reloadPage();
  }

  deleteServer(server: Server): void {
    this.appState$ = this.serverService.delete$(server.id)
      .pipe(
        map(response => {
          this.dataSubject.next(
            {...response,
              data: {servers: this.dataSubject.value.data.servers.filter(s => s.id !== server.id)}}
          );
          return {dataState: DataState.LOADED_STATE, appData: this.dataSubject.value}
        }),
        startWith({dataState: DataState.LOADED_STATE, appData: this.dataSubject.value}),
        catchError((error: String) => {
          this.filterSubject.next('');
          return of({dataState: DataState.ERROR_STATE, error: error})
        })
      );
  }

  printReport(): void {
    this.appState$ = this.serverService.print$()
      .pipe(
        map(response => {
          this.dataSubject.next(
            {...response,
              data: {servers: this.dataSubject.value.data.servers}}
          );
          return {dataState: DataState.LOADED_STATE,  appData: this.dataSubject.value}
        }),
        startWith({dataState: DataState.LOADED_STATE, appData: this.dataSubject.value}),
        catchError((error: String) => {
          this.filterSubject.next('');
          return of({dataState: DataState.ERROR_STATE, error: error})
        })
      );
  }

  reloadPage() {
    window.location.reload();
  }

  setServer(server1: Server){
    this.serverUpd = server1;
  }

  checkServer(server: Server): Boolean{
    if (typeof server === "undefined"){
      return false;
    } else {
      return true;
    }
  }
}






