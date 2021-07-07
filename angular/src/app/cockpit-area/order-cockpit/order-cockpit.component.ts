import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Sort as MaterialSort } from '@angular/material/sort';
import { TranslocoService } from '@ngneat/transloco';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { ConfigService } from '../../core/config/config.service';
import {
  FilterCockpit,
  Pageable,
  Sort,
} from '../../shared/backend-models/interfaces';
import {
  OrderListView,
  TextLabel,
} from '../../shared/view-models/interfaces';
import { WaiterCockpitService } from '../services/waiter-cockpit.service';
import { OrderDialogComponent } from './order-dialog/order-dialog.component';
import { OrderStatus } from '../models/orders'
import * as fromApp from '../../store/reducers';
import * as cockpitAreaActions from "../store/actions/cockpit-area.actions";
import { Store } from '@ngrx/store';
@Component({
  selector: 'app-cockpit-order-cockpit',
  templateUrl: './order-cockpit.component.html',
  styleUrls: ['./order-cockpit.component.scss'],
})
export class OrderCockpitComponent implements OnInit, OnDestroy {
  @ViewChild('pagingBar', { static: true }) pagingBar: MatPaginator;
  private translocoSubscription = Subscription.EMPTY;
  private pageable: Pageable = {
    pageSize: 8,
    pageNumber: 0,
  };
  private sorting: Sort[] = [];
  pageSize = 8;
  orders: OrderListView[] = [];
  totalOrders: number;
  columns: TextLabel[];
  displayedColumns: string[] = [
    'booking.bookingDate',
    'booking.table',
    'booking.name',
    'paid',
    'status',
    'cancel',
  ];
  status: string[];
  paymentStatus: string[];
  pageSizes: number[];
  filters: FilterCockpit = {
    bookingDate: undefined,
    email: undefined,
    bookingToken: undefined,
    paymentStatus: undefined,
    status: undefined,
  };
  reslut: any;
  constructor(
    private dialog: MatDialog,
    private translocoService: TranslocoService,
    private waiterCockpitService: WaiterCockpitService,
    private configService: ConfigService,
    private store: Store<fromApp.State>,
  ) {
    this.pageSizes = this.configService.getValues().pageSizes;
  }

  ngOnInit(): void {
    this.applyFilters();

    this.translocoService.langChanges$.subscribe((event: any) => {
      this.setTableHeaders(event);
      moment.locale(this.translocoService.getActiveLang());
    });
  }

  sendStatus(status: number, element: OrderListView): void {
    element.order.status = status.toString(); // for testing purposes
    var oderStatus: OrderStatus = {
      order: {
        id: element.order.id,
        status: status
      }
    };
    this.store.dispatch(cockpitAreaActions.updateOrderStatus({order : oderStatus }));
    setTimeout(() => this.applyFilters(), 700); 
  }

  cancelOrder(element: OrderListView): void {
    this.store.dispatch(cockpitAreaActions.cancelOrder({id : element.order.id }));
    setTimeout(() => this.applyFilters(), 500); 
  }

 
  sendPaymentStatus(newPaymentStatus: boolean, element: OrderListView): void {
    element.order.paid = newPaymentStatus; // for testing purposes
    var oderStatus: OrderStatus = {
      order: {
        id: element.order.id,
        paid: newPaymentStatus
      }
    };
    this.store.dispatch(cockpitAreaActions.updatePaymentStatus({order : oderStatus }));
    setTimeout(() => this.applyFilters(), 700); 
  }


  setTableHeaders(lang: string): void {
    this.translocoSubscription = this.translocoService
      .selectTranslateObject('cockpit.table', {}, lang)
      .subscribe((cockpitTable) => {
        this.columns = [
          { name: 'booking.bookingDate', label: cockpitTable.reservationDateH },
          { name: 'booking.table', label: cockpitTable.tableIdH },
          { name: 'booking.name', label: cockpitTable.ownerH },
          { name: 'paid', label: cockpitTable.paymentStatusH },
          { name: 'status', label: cockpitTable.statusH },
          { name: 'cancel', label: cockpitTable.cancelH },
        ];
        this.status = [
          cockpitTable.statusTaken,
          cockpitTable.statusPrepared,
          cockpitTable.statusInDelivery,
          cockpitTable.statusDelivered
        ];
        this.paymentStatus = [
          cockpitTable.paymentStatusNotPaid,
          cockpitTable.paymentStatusPaid
        ]
      });
  }

  applyFilters(): void {
    if (this.sorting.length === 0) {
      this.sorting.push({ property: 'booking.bookingDate', direction: 'asc' });
     // this.sorting.push({ property: 'paid', direction: 'desc' });
    }

    this.waiterCockpitService
      .getOrders(this.pageable, this.sorting, this.filters)
      .subscribe((data: any) => {
        if (!data) {
          this.orders = [];
        } else {
          this.orders = data.content;
        }
        this.totalOrders = data.totalElements;
      });
  }

  clearFilters(filters: any): void {
    filters.reset();
    this.applyFilters();
    this.pagingBar.firstPage();
  }

  page(pagingEvent: PageEvent): void {
    this.pageable = {
      pageSize: pagingEvent.pageSize,
      pageNumber: pagingEvent.pageIndex,
      sort: this.pageable.sort,
    };
    this.applyFilters();
  }

  sort(sortEvent: MaterialSort): void {
    this.sorting = [];
    if (sortEvent.direction) {
      this.sorting.push({
        property: sortEvent.active,
        direction: '' + sortEvent.direction,
      });
    }
    this.applyFilters();
  }
  selected(selection: OrderListView): void {
    let dialogRef = this.dialog.open(OrderDialogComponent, {
      width: '80%',
      data: selection,
    });
    //refreshing the list after closing the dialog
    dialogRef.afterClosed().subscribe(() => this.applyFilters());
  }

  ngOnDestroy(): void {
    this.translocoSubscription.unsubscribe();
  }
}
