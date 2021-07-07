import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Pageable,
  Sort,
  UserInfo,
  UserListCriteria,
} from 'app/shared/backend-models/interfaces';
import { Observable } from 'rxjs';
import {  exhaustMap} from 'rxjs/operators';
import { ConfigService } from '../../core/config/config.service';
import {
  UserListResponse,

} from '../../shared/view-models/interfaces';



@Injectable({
  providedIn: 'root'
})
export class UsermanagementCockpitService {

  private readonly getUsersRestPath: string =
  'usermanagement/v1/user/search';
  private readonly createUserRestPath: string =
  'usermanagement/v1/user/';
  private readonly deleteUserRestPath: string =
  'usermanagement/v1/user/';
  private readonly updateUserRestPath: string =
  'usermanagement/v1/user/update/';
  private readonly resetUserPasswordRestPath: string =
  'usermanagement/v1/user/reset/password/request/';

private readonly restServiceRoot$: Observable<
  string
> = this.config.getRestServiceRoot();
temp :any;
constructor(
  private http: HttpClient, 
  private config: ConfigService,
) {}



getUsers(
  pageable: Pageable,
  sorting: Sort[],
): Observable<UserListResponse[]> {
  pageable.sort =sorting;
  var temp : UserListCriteria ={"pageable":pageable};
 
  console.log(temp);
  return this.restServiceRoot$.pipe(
    exhaustMap((restServiceRoot) =>
      this.http.post<UserListResponse[]>(`${restServiceRoot}${this.getUsersRestPath}`, temp),
    ),
  );
}
postNewUser(userDetails :UserInfo){
  return this.restServiceRoot$.pipe(
    exhaustMap((restServiceRoot) =>
      this.http.post(`${restServiceRoot}${this.createUserRestPath}`, userDetails),
    ),
  );
}
deleteUser(id :number){
  var pathID= id.toString() + "/";
  return this.restServiceRoot$.pipe(
    exhaustMap((restServiceRoot) =>
      this.http.delete(`${restServiceRoot}${this.deleteUserRestPath}${pathID}`, ),
    ),
  );
}
updateUser(UserInfo :UserInfo){
  return this.restServiceRoot$.pipe(
    exhaustMap((restServiceRoot) =>
      this.http.post(`${restServiceRoot}${this.updateUserRestPath}`, UserInfo),
    ),
  );
}
resetUserPassword(Email :String){
 let body = {email : Email};
  return this.restServiceRoot$.pipe(
    exhaustMap((restServiceRoot) =>
      this.http.post(`${restServiceRoot}${this.resetUserPasswordRestPath}`, body),
    ),
  );
}
}
