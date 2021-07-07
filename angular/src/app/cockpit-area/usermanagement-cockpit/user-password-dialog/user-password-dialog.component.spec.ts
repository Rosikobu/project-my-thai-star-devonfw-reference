import { async, TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CoreModule } from '../../../core/core.module';
import { PriceCalculatorService } from '../../../sidenav/services/price-calculator.service';
import { WaiterCockpitModule } from '../../cockpit.module';
import { WaiterCockpitService } from '../../services/waiter-cockpit.service';
import { UserPasswordDialogComponent } from './user-password-dialog.component';
import { ConfigService } from '../../../core/config/config.service';
import { provideMockStore } from '@ngrx/store/testing';
import { config } from '../../../core/config/config';
import { getTranslocoModule } from '../../../transloco-testing.module';
import { UserInfo } from '../../../../in-memory-test-data/db-user-details';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { StoreModule } from '@ngrx/store';
import * as fromRoot from '../../store/reducers';
import { EffectsModule } from '@ngrx/effects';
import { JsonpClientBackend } from '@angular/common/http';
import { click } from 'app/shared/common/test-utils';

const mockDialogRef = {
  close: jasmine.createSpy('close'),
};


describe('UserPasswordDialogComponent', () => {
  let component: UserPasswordDialogComponent;
  let fixture: ComponentFixture<UserPasswordDialogComponent>;
  let initialState;
  let el: DebugElement;
  let matDialogRef: MatDialogRef<UserPasswordDialogComponent>;

  beforeEach(async(() => {
    initialState = { config };
    TestBed.configureTestingModule({
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: UserInfo },
        { provide: MatDialogRef, useValue: mockDialogRef },
        WaiterCockpitService,
        PriceCalculatorService,
        provideMockStore({ initialState }),
        ConfigService
      ],
      imports: [
        BrowserAnimationsModule,
        WaiterCockpitModule,
        getTranslocoModule(),
        CoreModule,
        EffectsModule.forRoot([]),
        StoreModule.forRoot(fromRoot.reducers, {
          runtimeChecks: {
            strictStateImmutability: true,
            strictActionImmutability: true,
          },
        })
      ],
    }).compileComponents().then(() => {
      fixture = TestBed.createComponent(UserPasswordDialogComponent);
      component = fixture.componentInstance;
      el = fixture.debugElement;
      matDialogRef = TestBed.inject(MatDialogRef);
    });
  }));

  it('should create',() => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });


  it('change a users password when filling in a new one and submitting it',() => {
    fixture.detectChanges();
    const password = component.checkoutForm.controls.password;
    const repeatPassword = component.checkoutForm.controls.confirmedPassword;
    
    // old password in database
    component.UserInfo.password = '123';
    fixture.detectChanges();
    expect(component.UserInfo.password).toBe('123');

    // filling in new password values
    password.setValue("456");
    repeatPassword.setValue("456");

    // without submitting old password persists
    expect(component.UserInfo.password).toBe('123');
    // new password values are being submitted to the backend
    el.query(By.css('form')).triggerEventHandler('ngSubmit', null);

    // user has a new password
    expect(component.UserInfo.password).toBe('456');
  });

  it('should set the checkoutform to invalid when password and confirm password do not match',() => {
    fixture.detectChanges();
    const password = component.checkoutForm.controls.password;
    const repeatPassword = component.checkoutForm.controls.confirmedPassword;

    password.setValue("400");
    expect(component.checkoutForm.valid).toBe(false);

    repeatPassword.setValue("401");
    expect(component.checkoutForm.valid).toBe(false);

    repeatPassword.setValue("400");
    expect(component.checkoutForm.valid).toBe(true);
  });

  it('should call the method resetUserPassword() when clicking on the send reset link button',() => {
    fixture.detectChanges();
    spyOn(component, 'resetUserPassword');
    const sendResetButton = el.query(By.css('.mat-stroked-button'));
    click(sendResetButton);

    expect(component.resetUserPassword).toHaveBeenCalled();
  });
});
