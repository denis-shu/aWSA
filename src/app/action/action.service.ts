import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';

import { ActionData } from './action-data.model';
import { AuthService } from '../user/auth.service';

@Injectable()
export class ActionService {
  dataEdited = new BehaviorSubject<boolean>(false);
  dataIsLoading = new BehaviorSubject<boolean>(false);
  dataLoaded = new Subject<ActionData[]>();
  dataLoadFailed = new Subject<boolean>();
  userData: ActionData;
  constructor(private http: Http,
              private authService: AuthService) {
  }

  onStoreData(data: ActionData) {
    this.dataLoadFailed.next(false);
    this.dataIsLoading.next(true);
    this.dataEdited.next(false);
    this.userData = data;
        this.authService.getAuthenticatedUser().getSession((err, session)=>{
      if(err){
        return;
      }
	  console.log(session.idToken.jwtToken);
     // console.log(session.accessToken.jwtToken);
      console.log('session');
      this.http.post('https://d4w1xxxx/action', data, {
        headers: new Headers({'Authorization': session.getIdToken().getJwtToken()})
      })
        .subscribe(
          (result) => {
            this.dataLoadFailed.next(false);
            this.dataIsLoading.next(false);
            this.dataEdited.next(true);
          },
          (error) => {
            this.dataIsLoading.next(false);
            this.dataLoadFailed.next(true);
            this.dataEdited.next(false);
          }
        );
    });
     
  }
  onRetrieveData(all = true) {
    this.dataLoaded.next(null);
    this.dataLoadFailed.next(false);
	this.authService.getAuthenticatedUser().getSession((err, session) => {
      let queryParam = '?accessToken='+ session.accessToken.jwtToken;
	
     
      let urlParam = 'all';
      if (!all) {
        urlParam = 'single';
      }
      this.http.get('https://asdf' + urlParam + queryParam, {
        headers: new Headers({'Authorization': session.idToken.jwtToken})
      })
        .map(
          (response: Response) => response.json()
        )
        .subscribe(
          (data) => {
            if (all) {
              this.dataLoaded.next(data);
            } else {
              console.log(data);
              if (!data) {
                this.dataLoadFailed.next(true);
                return;
              }
              this.userData = data[0];
              this.dataEdited.next(true);
            }
          },
          (err) => {
            this.dataLoadFailed.next(true);
            this.dataLoaded.next(null);
          }
        );
	}); 
  }
  onDeleteData() {
    this.dataLoadFailed.next(false);
      this.http.delete('https://fdsgs', {
        headers: new Headers({'Authorization': 'XXX'})
      })
        .subscribe(
          (data) => {
            console.log(data);
          },
          (error) => this.dataLoadFailed.next(true)
        );
  }
}
