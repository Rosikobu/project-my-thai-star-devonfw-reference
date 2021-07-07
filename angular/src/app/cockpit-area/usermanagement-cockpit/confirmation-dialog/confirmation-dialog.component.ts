import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserInfo } from 'app/shared/backend-models/interfaces';
import * as fromApp from "../../../store/reducers";
import * as cockpitAreaActions from "../../store/actions/cockpit-area.actions";
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent implements OnInit {
  UserInfo: UserInfo = {
    id: 0,
    username: '',
    password: '',
    email: '',
    userRoleId: 0,
    twoFactorStatus: undefined,
  };
  constructor(
    @Inject(MAT_DIALOG_DATA) dialogData: any,
    private store: Store<fromApp.State>,
  ) {
    this.UserInfo = dialogData;
  }

  ngOnInit(): void {
  }
  deleteUser(): void {
    this.store.dispatch(cockpitAreaActions.deleteUser({ UserInfo: this.UserInfo }));

  }

}

