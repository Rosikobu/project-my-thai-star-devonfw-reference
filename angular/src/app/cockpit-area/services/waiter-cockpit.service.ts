import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  FilterCockpit,
  Pageable,
  Sort,
} from 'app/shared/backend-models/interfaces';
import { cloneDeep, map } from 'lodash';
import { Observable } from 'rxjs';
import {  exhaustMap } from 'rxjs/operators';
import { ConfigService } from '../../core/config/config.service';
import {
  BookingResponse,
  DishView,
  OrderResponse,
  OrderView,
  OrderViewResult,
} from '../../shared/view-models/interfaces';
import { PriceCalculatorService } from '../../sidenav/services/price-calculator.service';
import { OrderStatus } from '../models/orders';

@Injectable()
export class WaiterCockpitService {
  private readonly getReservationsRestPath: string =
    'bookingmanagement/v1/booking/search';
  private readonly getOrdersRestPath: string =
    'ordermanagement/v1/order/search';
  private readonly filterOrdersRestPath: string =
    'ordermanagement/v1/order/search';
  private readonly orderStatusUpdateRestPath: string =
    'ordermanagement/v1/order/status/update';
  private readonly orderCancelRestPath: string =
    'ordermanagement/v1/order/cancelorder';
  private readonly orderPaymentStatusUpdateRestPath: string =
    'ordermanagement/v1/order/payment/update';
  private readonly orderArchivRestPath: string =
    'ordermanagement/v1/order/archived';
  private readonly filtersDishRestPath: string =
    'dishmanagement/v1/dish/search';
  private readonly restServiceRoot$: Observable<
    string
  > = this.config.getRestServiceRoot();
  temp: any;
  constructor(
    private http: HttpClient,
    private priceCalculator: PriceCalculatorService,
    private config: ConfigService,
  ) { }


  getDishes(
    filters: any,
  ): Observable<{ pageable: Pageable; content: DishView[] }> {
    return this.restServiceRoot$.pipe(
      exhaustMap((restServiceRoot) =>
        this.http.post<{ pageable: Pageable; content: DishView[] }>(
          `${restServiceRoot}${this.filtersDishRestPath}`,
          filters,
        ),
      ),
    );
  }


  getArchivedOrders(
    pageable: Pageable,
    sorting: Sort[],
    filters: FilterCockpit,
  ): Observable<OrderResponse[]> {
    let path: string;
    filters.pageable = pageable;
    filters.pageable.sort = sorting;
    if (filters.email || filters.bookingToken) {
      path = this.filterOrdersRestPath;
    } else {
      delete filters.email;
      delete filters.bookingToken;
      path = this.getOrdersRestPath;
    }
    return this.restServiceRoot$.pipe(
      exhaustMap((restServiceRoot) =>
        this.http.post<OrderResponse[]>(`${restServiceRoot}${this.orderArchivRestPath}`, filters),
      ) ,
    );
  }
  getOrders(
    pageable: Pageable,
    sorting: Sort[],
    filters: FilterCockpit,
  ): Observable<OrderResponse[]> {
    let path: string;
    filters.pageable = pageable;
    filters.pageable.sort = sorting;
    if (filters.email || filters.bookingToken) {
      path = this.filterOrdersRestPath;
    } else {
      delete filters.email;
      delete filters.bookingToken;
      path = this.getOrdersRestPath;
    }
    return this.restServiceRoot$.pipe(

      exhaustMap((restServiceRoot) =>
        this.http.post<OrderResponse[]>(`${restServiceRoot}${path}`, filters),
      ),
    );
  }

  /**
   * send a http get request to the backend to cancel an order
   * @param id the id of the order 
   */
  getCancelOrder(id: number): Observable<any> {
    var pathID = "/" + id.toString() + "/";
    return this.restServiceRoot$.pipe(
      exhaustMap((restServiceRoot) =>
        this.http.get(`${restServiceRoot}${this.orderCancelRestPath}${pathID}`),
      ),
    );
  }
/**
 * sending the order status to the backend via Http Post 
 * @param orderStaus  object containg  the id of the order and status 
 */
  postOrderStauts(orderStaus: OrderStatus): Observable<any> {
    return this.restServiceRoot$.pipe(
      exhaustMap((restServiceRoot) =>
        this.http.post(`${restServiceRoot}${this.orderStatusUpdateRestPath}`, orderStaus),
      ),
    );
  }
/**
 * sending the order paid status to the backend via Http Post 
 * @param orderStaus  object containg  the id of the order and paid status 
 */
  postOrderPaymentStatus(orderStaus: OrderStatus): Observable<any> {
    return this.restServiceRoot$.pipe(
      exhaustMap((restServiceRoot) =>
        this.http.post(`${restServiceRoot}${this.orderPaymentStatusUpdateRestPath}`, orderStaus),
      ),
    );
  }


  getReservations(
    pageable: Pageable,
    sorting: Sort[],
    filters: FilterCockpit,
  ): Observable<BookingResponse[]> {
    filters.pageable = pageable;
    filters.pageable.sort = sorting;
    return this.restServiceRoot$.pipe(
      exhaustMap((restServiceRoot) =>
        this.http.post<BookingResponse[]>(
          `${restServiceRoot}${this.getReservationsRestPath}`,
          filters,
        ),
      ),
    );
  }

  orderComposer(orderList: OrderView[]): OrderView[] {
    const orders: OrderView[] = cloneDeep(orderList);
    map(orders, (o: OrderViewResult) => {
      o.dish.price = this.priceCalculator.getPrice(o);
      o.extras = map(o.extras, 'name').join(', ');
    });
    return orders;
  }

  getTotalPrice(orderLines: OrderView[]): number {
    return this.priceCalculator.getTotalPrice(orderLines);
  }

}
