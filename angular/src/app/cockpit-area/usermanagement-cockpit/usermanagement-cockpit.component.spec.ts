import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { State } from '../../store';
import { ConfigService } from '../../core/config/config.service';
import { WaiterCockpitService } from '../services/waiter-cockpit.service';
import { UsermanagementCockpitComponent } from './usermanagement-cockpit.component';
import { config } from '../../core/config/config';
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
import { getTranslocoModule } from '../../transloco-testing.module';
import { CoreModule } from '../../core/core.module';
import { PageEvent } from '@angular/material/paginator';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { click } from '../../shared/common/test-utils';
import { ascSortOrder } from '../../../in-memory-test-data/db-order-asc-sort';
import { users } from '../../../in-memory-test-data/db-users';
import { UsermanagementCockpitService } from '../services/usermanagement-cockpit.service';
import { AuthService } from 'app/core/authentication/auth.service';
import { SnackBarService } from 'app/core/snack-bar/snack-bar.service';
import { SnackService } from 'app/user-area/services/snack-bar.service';


const mockDialog = {
  open: jasmine.createSpy('open').and.returnValue({
    afterClosed: () => of(true),
  }),
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
      declarations: [UsermanagementCockpitComponent],
      providers: [
        { provide: MatDialog, useValue: mockDialog },
        { provide: UsermanagementCockpitService, useValue: waiterCockpitStub },
        { provide: AuthService, useValue: waiterCockpitServiceStub2 },
        { provide: SnackBarService},
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

describe('UsermanagementCockpitComponent', () => {
  let component: UsermanagementCockpitComponent;
  let fixture: ComponentFixture<UsermanagementCockpitComponent>;
  let store: Store<State>;
  let initialState;
  let usermanagementCockpitService: UsermanagementCockpitService;
  let dialog: MatDialog;
  let translocoService: TranslocoService;
  let configService: ConfigService;
  let el: DebugElement;
  let authService: AuthService;
  let snackBar: SnackBarService;

  beforeEach(async(() => {
    initialState = { config };
    TestBedSetUp.loadWaiterCockpitServiceStud(waiterCockpitServiceStub)
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(UsermanagementCockpitComponent);
        component = fixture.componentInstance;
        el = fixture.debugElement;
        store = TestBed.inject(Store);
        configService = new ConfigService(store);
        usermanagementCockpitService = TestBed.inject(UsermanagementCockpitService);
        dialog = TestBed.inject(MatDialog);
        translocoService = TestBed.inject(TranslocoService);
        authService = TestBed.inject(AuthService);
        snackBar = TestBed.inject(SnackBarService);
      });
  }));

  it('should create component and verify content and total users of UsermanagementCockpit', fakeAsync(() => {

    fixture.detectChanges();
    tick();
    expect(component).toBeTruthy();
    expect(component.users).toEqual(users.content);
    expect(component.totalOrders).toBe(3);
  }));

  it('should go to next page of UsermanagementCockpit', () => {
    component.page({
      pageSize: 100,
      pageIndex: 2,
      length: 50,
    });
    expect(component.users).toEqual(users.content);
    expect(component.totalOrders).toBe(3);
  });


  it('should open user-dialog when clicking on a user', () => {
    fixture.detectChanges();
    spyOn(snackBar, 'openSnack');
    const clearFilter = el.queryAll(By.css('.mat-row'));
    click(clearFilter[0]);
    expect(dialog.open).toHaveBeenCalled();
    expect(snackBar.openSnack).not.toHaveBeenCalled();
  });

  /* function got removed
  it('should open snackbar-error when clicking on the admin-user', fakeAsync(() => {
    fixture.detectChanges();
    spyOn(snackBar, 'openSnack');
    const clearFilter = el.queryAll(By.css('.mat-row'));
    component.currentUser = 'franky';
    click(clearFilter[0]);
    tick(200);
    expect(snackBar.openSnack).toHaveBeenCalled();
  }));
  */

  it('should open changePassword dialog when clicking on the button', () => {
    fixture.detectChanges();
    spyOn(snackBar, 'openSnack');
    const clearFilter = el.queryAll(By.css('.mat-mini-fab'));
    click(clearFilter[0]);
    expect(snackBar.openSnack).not.toHaveBeenCalled();
    expect(dialog.open).toHaveBeenCalled();
  });

  /* function got removed
  it('should open snackbar-error dialog when clicking on the admin', fakeAsync(() => {
    fixture.detectChanges();
    spyOn(snackBar, 'openSnack');
    const clearFilter = el.queryAll(By.css('.mat-mini-fab'));
    component.currentUser = 'franky';
    click(clearFilter[0]);
    tick(200);
    expect(snackBar.openSnack).toHaveBeenCalled();
  }));
  */

  it('should open addNewUser-dialog when clicking on the add-user button', () => {
    fixture.detectChanges();
    const clearFilter = el.queryAll(By.css('.mat-button'));
    click(clearFilter[0]);
    expect(dialog.open).toHaveBeenCalled();
  });
});

