
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfigService } from '../../../core/config/config.service';
import { WaiterCockpitService } from '../../services/waiter-cockpit.service';
import { TranslocoService } from '@ngneat/transloco';
import { UserInfo } from 'app/shared/backend-models/interfaces';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { UsermanagementCockpitService } from '../../services/usermanagement-cockpit.service';
import * as fromApp from '../../../store/reducers';
import * as cockpitAreaActions from "../../store/actions/cockpit-area.actions";
import { Store } from '@ngrx/store';


@Component({
  selector: 'app-user-password-dialog',
  templateUrl: './user-password-dialog.component.html',
  styleUrls: ['./user-password-dialog.component.scss']
})
export class UserPasswordDialogComponent implements OnInit {
  checkoutForm: FormGroup = new FormGroup({});
  UserInfo: UserInfo = {
    id: 0,
    username: '',
    password: '',
    email: '',
    userRoleId: 0,
    twoFactorStatus: undefined,
   
  };
  icon = 'visibility_off';
  fieldTextType: boolean = false;


  constructor(
    public dialogRef: MatDialogRef<UserPasswordDialogComponent>,
    private dialog: MatDialog,
    private waiterCockpitService: WaiterCockpitService,
    private UsermanagementCockpitService: UsermanagementCockpitService,
    private translocoService: TranslocoService,
    @Inject(MAT_DIALOG_DATA) dialogData: any,
    private configService: ConfigService,
    private fb: FormBuilder,
    private store: Store<fromApp.State>,
  ) {
    this.UserInfo = dialogData;
    this.checkoutForm = fb.group({
      password: ['', [Validators.required, Validators.min(8)]],
      confirmedPassword: ['', [Validators.required, Validators.min(8)]]
    }, {
      validator: this.ConfirmedValidator('password', 'confirmedPassword')
    });

   }

  ngOnInit(): void {
  }

  ConfirmedValidator(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];
      if (matchingControl.errors && !matchingControl.errors.confirmedValidator) {
        return;
      }
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ confirmedValidator: true });
      } else {
        matchingControl.setErrors(null);
      }
    }
  }
  get Form() {
    return this.checkoutForm.controls;
  }
  get password(): AbstractControl {
    return this.checkoutForm.get('password');
  }

  get confirmedPassword(): AbstractControl {
    return this.checkoutForm.get('confirmedPassword');
  }
  onSubmit(): void {
    this.UserInfo.password = this.checkoutForm.get("password").value;
    this.store.dispatch(cockpitAreaActions.updateUser({ UserInfo: this.UserInfo }));

  }
  toggleFieldTextType() {
    if (this.icon === 'visibility_off') {
      this.icon = 'visibility';
    } else {
      this.icon = 'visibility_off';
    }
    this.fieldTextType = !this.fieldTextType;
  }
  resetUserPassword(){
    this.store.dispatch(cockpitAreaActions.resetUserPassword({ Email: this.UserInfo.email }));
  }
}
