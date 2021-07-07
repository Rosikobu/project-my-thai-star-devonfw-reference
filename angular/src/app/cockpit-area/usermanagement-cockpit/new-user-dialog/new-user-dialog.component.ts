import { Component,  OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserInfo } from 'app/shared/backend-models/interfaces';
import * as fromApp from '../../../store/reducers';
import * as cockpitAreaActions from "../../store/actions/cockpit-area.actions";
import { Store } from '@ngrx/store';
@Component({
  selector: 'app-new-user-dialog',
  templateUrl: './new-user-dialog.component.html',
  styleUrls: ['./new-user-dialog.component.scss']
})
export class NewUserDialogComponent implements OnInit {

  checkoutForm: FormGroup;
  REGEXP_EMAIL = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  invalidmassage = ""
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
  userRoles: String[] = ["User", "Waiter", "Manger", "Admin"];
  userRoles2 = [{ roleTyp: "User", id: 0 }, { roleTyp: "Waiter", id: 1 }, { roleTyp: "Manger", id: 2 }, { roleTyp: "Admin", id: 3 }];
  selectedRole = { roleTyp: "User", id: 0 };
  constructor(
    private store: Store<fromApp.State>,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.checkoutForm = this.fb.group({
      username: new FormControl(this.UserInfo.username, Validators.required),
      email: new FormControl(this.UserInfo.email, [
        Validators.required,
        Validators.pattern(this.REGEXP_EMAIL),
      ]),
      password: new FormControl(this.UserInfo.password, Validators.required), //@later review
      confirmedPassword: ['', [Validators.required, Validators.min(8)]],
      userRoleId: new FormControl(this.UserInfo.userRoleId, Validators.required)
    }, {
      validator: this.ConfirmedValidator('password', 'confirmedPassword')
    });
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

  get form() {
    return this.checkoutForm.controls;
  }
  get username(): AbstractControl {
    return this.checkoutForm.get('username');
  }
  get email(): AbstractControl {
    return this.checkoutForm.get('email');
  }
  get password(): AbstractControl {
    return this.checkoutForm.get('password');
  }

  get userRoleId(): AbstractControl {
    return this.checkoutForm.get('userRoleId');
  }

  toggleFieldTextType() {
    if (this.icon === 'visibility_off') {
      this.icon = 'visibility';
    } else {
      this.icon = 'visibility_off';
    }
    this.fieldTextType = !this.fieldTextType;
  }

  checkIfEmpty(obj) {
    for (let key of Object.keys(obj)) {
      let data = obj[key];
      if (!data && key != "userRoleId") {
        return false;
      }
    }
    return true;
  }

  onSubmit(): void {
    if (this.checkIfEmpty(this.checkoutForm.value)) {
      var UserInfo = this.checkoutForm.value;
      delete UserInfo.confirmedPassword; //deleting the confirmedPassword and seending the password to the backend 
      this.store.dispatch(cockpitAreaActions.createUser({ UserInfo: UserInfo }));
    }
  }

}
