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
  SaveOrderResponse,
} from '../../shared/view-models/interfaces';
import { WaiterCockpitService } from '../services/waiter-cockpit.service';
import { ArchivDialogComponent } from './archiv-dialog/archiv-dialog.component';
import * as fromApp from '../../store/reducers';
import * as cockpitAreaActions from "../store/actions/cockpit-area.actions";
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-archiv-cockpit',
  templateUrl: './archiv-cockpit.component.html',
  styleUrls: ['./archiv-cockpit.component.scss'],
})
export class ArchivCockpitComponent implements OnInit, OnDestroy {
  @ViewChild('pagingBar', { static: true }) pagingBar: MatPaginator;
  private translocoSubscription = Subscription.EMPTY;
  private pageable: Pageable = {
    pageSize: 8,
    pageNumber: 0,
  };
  private sorting: Sort[] = [];
  pageSize = 8;
  pageSizes: number[];
  orders: OrderListView[] = [];
  totalOrders: number;
  columns: any[];
  tempData: SaveOrderResponse;
  displayedColumns: string[] = [
    'booking.bookingDate',
    'booking.tableId',
    'booking.name',
    'reactivate',
  ];
  status: string[];
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

  setTableHeaders(lang: string): void {
    this.translocoSubscription = this.translocoService
      .selectTranslateObject('cockpit.table', {}, lang)
      .subscribe((cockpitTable) => {
        this.columns = [
          { name: 'booking.bookingDate', label: cockpitTable.reservationDateH },
          { name: 'booking.tableId', label: cockpitTable.tableIdH },
          { name: 'booking.name', label: cockpitTable.ownerH },
          { name: 'reactivate', label: cockpitTable.reactivateH },
        ];
        this.status = [
          cockpitTable.statusTaken,
          cockpitTable.statusPrepared,
          cockpitTable.statusInDelivery,
          cockpitTable.statusDelivered,
        ];
      });
  }
  /**
   * send a http get request to the backend to reactivate the order
   * @param order the order to be reactivated 
   */
  reactivateOrder(order: OrderListView): void {
    this.store.dispatch(cockpitAreaActions.cancelOrder({ id: order.order.id }));
    setTimeout(() => this.applyFilters(), 500);
  }

  applyFilters(): void {
    if (this.sorting.length === 0) {
      // setting two defualt search crietria first the status of the order and the second is the date
      this.sorting.push({ property: 'status', direction: 'desc' });
      this.sorting.push({ property: 'booking.bookingDate', direction: 'desc' });
    }

    this.waiterCockpitService
      .getArchivedOrders(this.pageable, this.sorting, this.filters)
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
    var dialgoref = this.dialog.open(ArchivDialogComponent, {
      width: '80%',
      data: selection,
    });
    dialgoref.afterClosed().subscribe(() => this.applyFilters());
  }

  ngOnDestroy(): void {
    this.translocoSubscription.unsubscribe();

  }
}
