import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { State } from '../../store';
import { ConfigService } from '../../core/config/config.service';
import { WaiterCockpitService } from '../services/waiter-cockpit.service';
import { OrderCockpitComponent } from './order-cockpit.component';
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
import { orderData } from '../../../in-memory-test-data/db-order';


const mockDialog = {
  open: jasmine.createSpy('open').and.returnValue({
    afterClosed: () => of(true),
  }),
};

const translocoServiceStub = {
  selectTranslateObject: of({
    reservationDateH: 'Reservation Date',
    emailH: 'Email',
    bookingTokenH: 'Reference Number',
    ownerH: 'Owner',
    tableH: 'Table',
    creationDateH: 'Creation date',
  } as any),
};

const waiterCockpitServiceStub = {
  getOrders: jasmine.createSpy('getOrders').and.returnValue(of(orderData)),
  postOrderPaymentStatus: jasmine.createSpy('getPaymentStatus'),
  postOrderStauts: jasmine.createSpy('getOrderStatus')
  
  
};

const waiterCockpitServiceSortStub = {
  getOrders: jasmine.createSpy('getOrders').and.returnValue(of(ascSortOrder)),
};


class TestBedSetUp {
  static loadWaiterCockpitServiceStud(waiterCockpitStub: any): any {
    const initialState = { config };
    return TestBed.configureTestingModule({
      declarations: [OrderCockpitComponent],
      providers: [
        { provide: MatDialog, useValue: mockDialog },
        { provide: WaiterCockpitService, useValue: waiterCockpitStub },
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

describe('OrderCockpitComponent', () => {
  let component: OrderCockpitComponent;
  let fixture: ComponentFixture<OrderCockpitComponent>;
  let store: Store<State>;
  let initialState;
  let waiterCockpitService: WaiterCockpitService;
  let dialog: MatDialog;
  let translocoService: TranslocoService;
  let configService: ConfigService;
  let el: DebugElement;

  beforeEach(async(() => {
    initialState = { config };
    TestBedSetUp.loadWaiterCockpitServiceStud(waiterCockpitServiceStub)
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(OrderCockpitComponent);
        component = fixture.componentInstance;
        el = fixture.debugElement;
        store = TestBed.inject(Store);
        configService = new ConfigService(store);
        waiterCockpitService = TestBed.inject(WaiterCockpitService);
        dialog = TestBed.inject(MatDialog);
        translocoService = TestBed.inject(TranslocoService);
      });
  }));

  it('should create component and verify content and total records of orders', fakeAsync(() => {
    spyOn(translocoService, 'selectTranslateObject').and.returnValue(
      translocoServiceStub.selectTranslateObject,
    );
    fixture.detectChanges();
    tick();
    expect(component).toBeTruthy();
    expect(component.orders).toEqual(orderData.content);
    expect(component.totalOrders).toBe(8);
  }));

  it('should go to next page of orders', () => {
    component.page({
      pageSize: 100,
      pageIndex: 2,
      length: 50,
    });
    expect(component.orders).toEqual(orderData.content);
    expect(component.totalOrders).toBe(8);
  });

  it('should clear form and reset', fakeAsync(() => {
    const clearFilter = el.query(By.css('.orderClearFilters'));
    click(clearFilter);
    fixture.detectChanges();
    tick();
    expect(component.orders).toEqual(orderData.content);
    expect(component.totalOrders).toBe(8);
  }));

  it('should open OrderDialogComponent dialog on click of row', fakeAsync(() => {
    fixture.detectChanges();
    const clearFilter = el.queryAll(By.css('.mat-row'));
    click(clearFilter[0]);
    tick();
    expect(dialog.open).toHaveBeenCalled();
  }));

  it('should filter the order table on click of submit', fakeAsync(() => {
    fixture.detectChanges();
    const submit = el.query(By.css('.orderApplyFilters'));
    click(submit);
    tick();
    expect(component.orders).toEqual(orderData.content);
    expect(component.totalOrders).toBe(8);
  }));


  it('should change payement-status from false to true and from true to false on checkbox-click', () => {
    fixture.detectChanges();
    expect(component.orders[0].order.paid).toBe(false);
    const payementButton = el.queryAll(By.css('.mat-checkbox'));
    payementButton[0].triggerEventHandler('change', null);
    
    expect(component.orders[0].order.paid).toBe(true);
  });


  it('should call the method sendPaymentStatus when clicking payment-checkbox ', fakeAsync(() => {
    fixture.detectChanges();
    spyOn(component, 'sendPaymentStatus');
    const payementButton = el.queryAll(By.css('.mat-checkbox'));
    payementButton[0].triggerEventHandler('change', null);
    tick();
    expect(component.sendPaymentStatus).toHaveBeenCalled();
    }));

  it('should call the method sendStatus when clicking a status-change-button ', () => {
    fixture.detectChanges();
    spyOn(component, 'sendStatus');
    const statusButton = el.queryAll(By.css('.mat-button-toggle'));
    click(statusButton[8]);
    expect(component.sendStatus).toHaveBeenCalled();
    });

  it('should change status from Food is being prepared to Order taken',() => {
    fixture.detectChanges();
    expect(component.orders[0].order.status).toBe("1");
    const statusButton = el.queryAll(By.css('.mat-button-toggle'));
    click(statusButton[0]);
    expect(component.orders[0].order.status).toBe("0");
      });


  it('should change status from Order taken to Food is being delivered',() => {
    fixture.detectChanges();
    expect(component.orders[0].order.status).toBe("0");
    const statusButton = el.queryAll(By.css('.mat-button-toggle'));
    click(statusButton[2]);
    expect(component.orders[0].order.status).toBe("2");
      });

  it('should change status from Food is being delivered to Food arrived',() => {
    fixture.detectChanges();
    expect(component.orders[0].order.status).toBe("2");
    const statusButton = el.queryAll(By.css('.mat-button-toggle'));
    click(statusButton[3]);
    expect(component.orders[0].order.status).toBe("3");
      });

  it('should change status from Food arrived to Order taken',() => {
    fixture.detectChanges();
    expect(component.orders[0].order.status).toBe("3");
    const statusButton = el.queryAll(By.css('.mat-button-toggle'));
    click(statusButton[0]);
    expect(component.orders[0].order.status).toBe("0");
      });


  it('should call the method sendGetCancelOrder when clicking the cancel-order button ', fakeAsync(() => {
      fixture.detectChanges();
      spyOn(component, 'cancelOrder');
      const cancelButton = el.queryAll(By.css('.mat-mini-fab'));
      click(cancelButton[0]);
      tick();
      expect(component.cancelOrder).toHaveBeenCalled();
      }));
  });








describe('TestingOrderCockpitComponentWithSortOrderData', () => {
  let component: OrderCockpitComponent;
  let fixture: ComponentFixture<OrderCockpitComponent>;
  let store: Store<State>;
  let initialState;
  let waiterCockpitService: WaiterCockpitService;
  let dialog: MatDialog;
  let translocoService: TranslocoService;
  let configService: ConfigService;
  let el: DebugElement;

  beforeEach(async(() => {
    initialState = { config };
    TestBedSetUp.loadWaiterCockpitServiceStud(waiterCockpitServiceSortStub)
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(OrderCockpitComponent);
        component = fixture.componentInstance;
        el = fixture.debugElement;
        store = TestBed.inject(Store);
        configService = new ConfigService(store);
        waiterCockpitService = TestBed.inject(WaiterCockpitService);
        dialog = TestBed.inject(MatDialog);
        translocoService = TestBed.inject(TranslocoService);
      });
  }));

  it('should sort records of orders', () => {
    component.sort({
      active: 'Reservation Date',
      direction: 'asc',
    });
    expect(component.orders).toEqual(ascSortOrder.content);
    expect(component.totalOrders).toBe(8);
  });
});
