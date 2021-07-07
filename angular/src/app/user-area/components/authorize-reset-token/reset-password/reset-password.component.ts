import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UserPasswordToken } from 'app/user-area/models/user';
import * as fromApp from '../../../../store/reducers';
import * as authActions from"../../../store/actions/auth.actions";
import { Store } from '@ngrx/store';
@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  animationState = false;
  loading = false;
  token: string;
  passwordToken:UserPasswordToken = {
    password : '',
    token : ''
  };
  fieldTextType: boolean = false;
  icon = 'visibility_off';
  checkoutForm: FormGroup = new FormGroup({});

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private store: Store<fromApp.State>,
    ) {
    this.activatedRoute.queryParams.subscribe(params => {
      this.token = params['token'];
    });

    this.checkoutForm = fb.group({
      password: ['', [Validators.required, Validators.min(8)]],
      confirmedPassword: ['', [Validators.required, Validators.min(8)]]
    }, {
      validator: this.ConfirmedValidator('password', 'confirmedPassword'), 

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
  get getForm() {
    return this.checkoutForm.controls;
  }
  get password(): AbstractControl {
    return this.checkoutForm.get('password');
  }
  get confirmedPassword(): AbstractControl {
    return this.checkoutForm.get('confirmedPassword');
  }

  toggleFieldTextType() {
    if (this.icon === 'visibility_off') {
      this.icon = 'visibility';
    } else {
      this.icon = 'visibility_off';
    }
    this.fieldTextType = !this.fieldTextType;
  }
  
  onSubmit(): void {
    this.loading = true;
    this.passwordToken.password = this.checkoutForm.get("password").value;
    this.passwordToken.token = this.token;
    this.store.dispatch(authActions.updatePassword({UserInfo :{password : this.checkoutForm.get("password").value , token : this.token}}));
    

  }
}
