import { Component, Inject, OnInit } from '@angular/core';
import {  MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserInfo } from 'app/shared/backend-models/interfaces';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import * as fromApp from '../../../store/reducers';
import * as cockpitAreaActions from "../../store/actions/cockpit-area.actions";
import { Store } from '@ngrx/store';
import { AuthService } from 'app/core/authentication/auth.service';
import { SnackBarService } from '../../../core/snack-bar/snack-bar.service';
@Component({
  selector: 'app-user-details-dialog',
  templateUrl: './user-details-dialog.component.html',
  styleUrls: ['./user-details-dialog.component.scss']
})
export class UserDetailsDialogComponent implements OnInit {

  Form: FormGroup = new FormGroup({});
  REGEXP_EMAIL = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  userInfo: UserInfo = {
    id: 0,
    username: '',
    password: '',
    email: '',
    userRoleId: 0,
    twoFactorStatus: undefined,
  };
  currentUser;
  icon = 'visibility_off';
  fieldTextType: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<UserDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) dialogData: any,
    private authService: AuthService,
    private store: Store<fromApp.State>,
    public snackBar: SnackBarService
  ) {
    delete dialogData.modificationCounter;
    delete dialogData.twoFactorStatus;
    this.userInfo = dialogData;
    this.authService.getUser().subscribe((username) => {
      this.currentUser = username;
    });
    this.Form = new FormGroup({
      username: new FormControl(this.userInfo.username, Validators.required),
      email: new FormControl(this.userInfo.email, [
        Validators.required,
        Validators.pattern(this.REGEXP_EMAIL),
      ]),
      userRoleId: new FormControl(this.userInfo.userRoleId, Validators.required),
    });
  }
  ngOnInit(): void {
  }
  onSubmit(): void {
    delete this.userInfo.password;
    var userInfoTemp: UserInfo = {
      id: this.userInfo.id,
      username:this.Form.get("username").value,
      password: '',
      email: this.Form.get("email").value,
      userRoleId:this.Form.get("userRoleId").value,
      twoFactorStatus: undefined,
    };
    delete userInfoTemp.password;
    this.store.dispatch(cockpitAreaActions.updateUser({ UserInfo: userInfoTemp }));
  }
  get username(): AbstractControl {
    return this.Form.get('username');
  }
  get email(): AbstractControl {
    return this.Form.get('email');
  }
  get userRoleId(): AbstractControl {
    return this.Form.get('userRoleId');
  }

  deleteUser(): void {
    if (this.userInfo.username != this.currentUser) {
      this.dialogRef.close(this.userInfo);
    } else {
      this.snackBar.openSnack(
        "Error you cannot delete your Account",
        6000,
        'red',
      );
    }
  }
  closeDialog() {
    this.dialogRef.close("");
  }
  toggleFieldTextType() {
    if (this.icon === 'visibility_off') {
      this.icon = 'visibility';
    } else {
      this.icon = 'visibility_off';
    }
    this.fieldTextType = !this.fieldTextType;
  }
  resetUserPassword() {
    this.store.dispatch(cockpitAreaActions.resetUserPassword({ Email: this.userInfo.email }));
  }

}
