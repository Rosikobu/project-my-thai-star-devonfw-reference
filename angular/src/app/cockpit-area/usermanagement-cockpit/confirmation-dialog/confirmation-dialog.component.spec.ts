import { async, TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CoreModule } from '../../../core/core.module';
import { PriceCalculatorService } from '../../../sidenav/services/price-calculator.service';
import { WaiterCockpitModule } from '../../cockpit.module';
import { WaiterCockpitService } from '../../services/waiter-cockpit.service';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import { ConfigService } from '../../../core/config/config.service';
import { provideMockStore } from '@ngrx/store/testing';
import { config } from '../../../core/config/config';
import { getTranslocoModule } from '../../../transloco-testing.module';
import { UserInfo } from '../../../../in-memory-test-data/db-user-details';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { StoreModule } from '@ngrx/store';
import * as fromRoot from '../../../store/reducers';
import { EffectsModule } from '@ngrx/effects';
import { JsonpClientBackend } from '@angular/common/http';
import { click } from 'app/shared/common/test-utils';

const mockDialogRef = {
  close: jasmine.createSpy('close'),
};


describe('ConfirmationDialogComponent', () => {
  let component: ConfirmationDialogComponent;
  let fixture: ComponentFixture<ConfirmationDialogComponent>;
  let initialState;
  let el: DebugElement;
  let matDialogRef: MatDialogRef<ConfirmationDialogComponent>;

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
      fixture = TestBed.createComponent(ConfirmationDialogComponent);
      component = fixture.componentInstance;
      el = fixture.debugElement;
      matDialogRef = TestBed.inject(MatDialogRef);
    });
  }));

  it('should create',() => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should call the method deleteUser() when clicking the remove user button',() => {
    fixture.detectChanges();
    spyOn(component, 'deleteUser');
    const deleteUserButton = el.query(By.css('.mat-stroked-button'));
    click(deleteUserButton);
    expect(component).toBeTruthy();
  });

});
