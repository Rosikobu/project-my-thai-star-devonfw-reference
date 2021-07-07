import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { State } from '../../../store';
import { ConfigService } from '../../../core/config/config.service';
import { WaiterCockpitService } from '../../services/waiter-cockpit.service';
import { NewUserDialogComponent } from './new-user-dialog.component';
import { config } from '../../../core/config/config';
import {
  TestBed,
  ComponentFixture,
  async,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { TranslocoService } from '@ngneat/transloco';
import { of } from 'rxjs/internal/observable/of';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { getTranslocoModule } from '../../../transloco-testing.module';
import { CoreModule } from '../../../core/core.module';
import { PageEvent } from '@angular/material/paginator';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { click } from '../../../shared/common/test-utils';
import { ascSortOrder } from '../../../../in-memory-test-data/db-order-asc-sort';
import { users } from '../../../../in-memory-test-data/db-users';
import { UsermanagementCockpitService } from '../../services/usermanagement-cockpit.service';
import { AuthService } from 'app/core/authentication/auth.service';
import { SnackBarService } from 'app/core/snack-bar/snack-bar.service';
import { SnackService } from 'app/user-area/services/snack-bar.service';
import { addUserTest } from '../../../../in-memory-test-data/db-add-User-test';



const mockDialog = {
  open: jasmine.createSpy('open').and.returnValue({
    afterClosed: () => of(true),
  }),
};

const mockDialogRef = {
  close: jasmine.createSpy('close'),
};

const waiterCockpitServiceStub = {
  getUsers: jasmine.createSpy('getUsers').and.returnValue(of(users)),
};

const waiterCockpitServiceStub2 = {
  getUser: jasmine.createSpy('getUser').and.returnValue(of('users')),
};



class TestBedSetUp {
  static loadWaiterCockpitServiceStud(waiterCockpitStub: any): any {
    const initialState = { config };
    return TestBed.configureTestingModule({
      declarations: [NewUserDialogComponent],
      providers: [
        { provide: MatDialog, useValue: mockDialog },
        { provide: UsermanagementCockpitService, useValue: waiterCockpitStub },
        { provide: AuthService, useValue: waiterCockpitServiceStub2 },
        { provide: SnackBarService},
        { provide: MatDialogRef, useValue: mockDialogRef },
        TranslocoService,
        ConfigService,
        provideMockStore({ initialState }),
      ],
      imports: [
        BrowserAnimationsModule,
        ReactiveFormsModule,
        getTranslocoModule(),
        CoreModule,
      ],
    });
  }
}

describe('newUserDialogComponent', () => {
  let component: NewUserDialogComponent;
  let fixture: ComponentFixture<NewUserDialogComponent>;
  let store: Store<State>;
  let initialState;
  let usermanagementCockpitService: UsermanagementCockpitService;
  let dialog: MatDialog;
  let translocoService: TranslocoService;
  let configService: ConfigService;
  let el: DebugElement;
  let authService: AuthService;
  let snackBar: SnackBarService;
  let matDialogRef: MatDialogRef<NewUserDialogComponent>;

  beforeEach(async(() => {
    initialState = { config };
    TestBedSetUp.loadWaiterCockpitServiceStud(waiterCockpitServiceStub)
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(NewUserDialogComponent);
        component = fixture.componentInstance;
        el = fixture.debugElement;
        store = TestBed.inject(Store);
        configService = new ConfigService(store);
        usermanagementCockpitService = TestBed.inject(UsermanagementCockpitService);
        dialog = TestBed.inject(MatDialog);
        translocoService = TestBed.inject(TranslocoService);
        authService = TestBed.inject(AuthService);
        snackBar = TestBed.inject(SnackBarService);
        matDialogRef = TestBed.inject(MatDialogRef);
      });
  }));


  it('should create component', fakeAsync(() => {
    expect(component).toBeTruthy();
  }));

  it('create new user', fakeAsync(() => {
    fixture.detectChanges();
    spyOn(store, 'dispatch');

    // filling addUser formfields
    const username = component.checkoutForm.controls.username;
    const email = component.checkoutForm.controls.email;
    const password = component.checkoutForm.controls.password;
    const confirmPassword = component.checkoutForm.controls.confirmedPassword;
    const userRoleId = component.checkoutForm.controls.userRoleId;
    username.setValue("Hans");
    email.setValue("hans@mail.de");
    password.setValue('123');
    confirmPassword.setValue('123');
    userRoleId.setValue(2);


    // submitting the input data, causing dispatch to be called
    expect(store.dispatch).not.toHaveBeenCalled();
    el.query(By.css('form')).triggerEventHandler('ngSubmit', null);
    expect(store.dispatch).toHaveBeenCalled();

    expect(component.checkoutForm.value).toEqual(addUserTest);
  }));

  it('should set the checkoutform to invalid when username or email is missing',() => {
    fixture.detectChanges();
    const username = component.checkoutForm.controls.username;
    const email = component.checkoutForm.controls.email;
    const password = component.checkoutForm.controls.password;
    const confirmPassword = component.checkoutForm.controls.confirmedPassword;
    const userRoleId = component.checkoutForm.controls.userRoleId;
    password.setValue('123');
    confirmPassword.setValue('123');
    userRoleId.setValue(2);

    // username and email missing
    expect(component.checkoutForm.valid).toBe(false);

    username.setValue("Hans");
    // email missing
    expect(component.checkoutForm.valid).toBe(false);

    email.setValue("hans@mail.de");
    // all forms are filled correctly
    expect(component.checkoutForm.valid).toBe(true);
  });


  it('should set the checkoutform to invalid when password and confirm password do not match',() => {
    fixture.detectChanges();
    const username = component.checkoutForm.controls.username;
    const email = component.checkoutForm.controls.email;
    const password = component.checkoutForm.controls.password;
    const confirmPassword = component.checkoutForm.controls.confirmedPassword;
    const userRoleId = component.checkoutForm.controls.userRoleId;
    password.setValue('123');
    confirmPassword.setValue('123');
    userRoleId.setValue(2);
    username.setValue("Hans");
    email.setValue("hans@mail.de");
    
    password.setValue("400");
    //passwords do not match
    expect(component.checkoutForm.valid).toBe(false);

    confirmPassword.setValue("401");
    // passwords do not match
    expect(component.checkoutForm.valid).toBe(false);

    confirmPassword.setValue("400");
    expect(component.checkoutForm.valid).toBe(true);
  });
});

