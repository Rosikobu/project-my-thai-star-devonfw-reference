import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { SnackBarService } from '../../../core/snack-bar/snack-bar.service';
import { UsermanagementCockpitService } from '../../services/usermanagement-cockpit.service';
import { WaiterCockpitService } from '../../services/waiter-cockpit.service';
import * as cockpitActions from '../actions/cockpit-area.actions';
import { TranslocoService } from '@ngneat/transloco';

@Injectable()
export class CockpitAreaEffects {
  createUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(cockpitActions.createUser),
      map((UserInfo) => UserInfo),
      switchMap((UserInfo: any) => {
        return this.UsermanagementCockpitService.postNewUser(UserInfo.UserInfo).pipe(
          map((res: any) =>
            cockpitActions.createUserSuccess(
              {
                id: res.id,
                username: res.username,
                email: res.email,
                password: res.password,
                userRoleId: res.userRoleId,
                twoFactorStatus: res.twoFactorStatus,

              },
            ),
          ),
          catchError((error) => of(cockpitActions.createUserFail({ error }))),
        );
      }),
    ),
  );

  createUserSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(cockpitActions.createUserSuccess),
        tap(() => {
          this.snackBar.openSnack(
            this.translocoService.translate('userManagement.userManagement.createUserSuccess'),
            4000,
            'green',
          );

        }),
      ),
    { dispatch: false },
  );

  createUserFail$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(cockpitActions.createUserFail),
        tap(() => {
          this.snackBar.openSnack(
            this.translocoService.translate('userManagement.userManagement.createUserFail'),
            4000,
            'red',
          );
        }),
      ),
    { dispatch: false },
  );

  deleteUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(cockpitActions.deleteUser),
      map((UserInfo) => UserInfo),
      switchMap((UserInfo: any) => {
        return this.UsermanagementCockpitService.deleteUser(UserInfo.UserInfo.id).pipe(
          map((res: any) =>
            cockpitActions.deleteUserSuccess(),
          ),
          catchError((error) => of(cockpitActions.deleteUserFail({ error }))),
        );
      }),
    ),
  );

  deleteUserSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(cockpitActions.deleteUserSuccess),
        tap(() => {
          this.snackBar.openSnack(
            this.translocoService.translate('userManagement.userManagement.deleteUserSuccess'),
            4000,
            'green',
          );
          
        }),
      ),
    { dispatch: false },
  );

  deleteUserFail$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(cockpitActions.deleteUserFail),
        tap(() => {
          this.snackBar.openSnack(
            this.translocoService.translate('userManagement.userManagement.deleteUserFail'),
            4000,
            'red',
          );
        }),
      ),
    { dispatch: false },
  );
  updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(cockpitActions.updateUser),
      map((UserInfo) => UserInfo),
      switchMap((UserInfo: any) => {
        return this.UsermanagementCockpitService.updateUser(UserInfo.UserInfo).pipe(
          map((res: any) =>
            cockpitActions.updateUserSuccess(),
          ),
          catchError((error) => of(cockpitActions.updateUserFail({ error }))),
        );
      }),
    ),
  );

  updateUserSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(cockpitActions.updateUserSuccess),
        tap(() => {
          this.snackBar.openSnack(
            this.translocoService.translate('userManagement.userManagement.updateSuccess'),
            4000,
            'green',
          );
          
        }),
      ),
    { dispatch: false },
  );

  updateUserFail$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(cockpitActions.updateUserFail),
        tap(() => {
          this.snackBar.openSnack(
            this.translocoService.translate('userManagement.userManagement.updateFail'),
            4000,
            'red',
          );
        }),
      ),
    { dispatch: false },
  );



  resetUserPassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(cockpitActions.resetUserPassword),
      map((UserInfo) => UserInfo),
      switchMap((UserInfo: any) => {
        return this.UsermanagementCockpitService.resetUserPassword(UserInfo.Email).pipe(
          map((res: any) =>
            cockpitActions.resetUserPasswordSuccess(),
          ),
          catchError((error) => of(cockpitActions.resetUserPasswordFail({ error }))),
        );
      }),
    ),
  );

  resetUserPasswordSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(cockpitActions.resetUserPasswordSuccess),
        tap(() => {
          this.snackBar.openSnack(
            this.translocoService.translate('userManagement.userManagement.updateSuccess'),
            4000,
            'green',
          );

        }),
      ),
    { dispatch: false },
  );

  resetUserPasswordFail$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(cockpitActions.resetUserPasswordFail),
        tap(() => {
          this.snackBar.openSnack(
            "Error please try again later",
            4000,
            'red',
          );
        }),
      ),
    { dispatch: false },
  );




  updatePaymentStatus$ = createEffect(() =>
  this.actions$.pipe(
    ofType(cockpitActions.updatePaymentStatus),
    map((order) => order),
    switchMap((order: any) => {
      return this.waiterCockpitService.postOrderPaymentStatus(order.order).pipe(
        map((res: any) =>
          cockpitActions.updatePaymentStatusSuccess(),
        ),
        catchError((error) => of(cockpitActions.updatePaymentStatusFail({ error }))),
      );
    }),
  ),
);

updatePaymentStatusSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(cockpitActions.updatePaymentStatusSuccess),
      tap(() => {
        this.snackBar.openSnack(
          this.translocoService.translate('alerts.updateOrderStatusSuccess'),
          4000,
          'green',
        );
      }),
    ),
  { dispatch: false },
);

updatePaymentStatusFail$ = createEffect(
  () =>
    this.actions$.pipe(
      ofType(cockpitActions.updatePaymentStatusFail),
      tap(() => {
        this.snackBar.openSnack(
          this.translocoService.translate('alerts.updateOrderStatusFail'),
          4000,
          'red',
        );
      }),
    ),
  { dispatch: false },
);



updateOrderStatus$ = createEffect(() =>
this.actions$.pipe(
  ofType(cockpitActions.updateOrderStatus),
  map((order) => order),
  switchMap((order: any) => {
    return this.waiterCockpitService.postOrderStauts(order.order).pipe(
      map((res: any) =>
        cockpitActions.updateOrderStatusSuccess(),
      ),
      catchError((error) => of(cockpitActions.updateOrderStatusFail({ error }))),
    );
  }),
),
);

updateOrderStatusSuccess$ = createEffect(() =>
  this.actions$.pipe(
    ofType(cockpitActions.updateOrderStatusSuccess),
    tap(() => {
      this.snackBar.openSnack(
        this.translocoService.translate('alerts.updateOrderStatusSuccess'),
        4000,
        'green',
      );
    }),
  ),
{ dispatch: false },
);

updateOrderStatusFail$ = createEffect(
() =>
  this.actions$.pipe(
    ofType(cockpitActions.updateOrderStatusFail),
    tap(() => {
      this.snackBar.openSnack(
        this.translocoService.translate('alerts.updateOrderStatusFail'),
        4000,
        'red',
      );
    }),
  ),
{ dispatch: false },
);



cancelOrder$ = createEffect(() =>
this.actions$.pipe(
  ofType(cockpitActions.cancelOrder),
  map((order) => order),
  switchMap((order: any) => {
    return this.waiterCockpitService.getCancelOrder(order.id).pipe(
      map((res: any) =>
        cockpitActions.cancelOrderSuccess(),
      ),
      catchError((error) => of(cockpitActions.cancelOrderFail({ error }))),
    );
  }),
),
);

cancelOrderSuccess$ = createEffect(() =>
  this.actions$.pipe(
    ofType(cockpitActions.cancelOrderSuccess),
    tap(() => {
      this.snackBar.openSnack(
        this.translocoService.translate('alerts.updateOrderStatusSuccess'),
        4000,
        'green',
      );
    }),
  ),
{ dispatch: false },
);

cancelOrderFail$ = createEffect(
() =>
  this.actions$.pipe(
    ofType(cockpitActions.cancelOrderFail),
    tap(() => {
      this.snackBar.openSnack(
        this.translocoService.translate('alerts.updateOrderStatusFail'),
        4000,
        'red',
      );
    }),
  ),
{ dispatch: false },
);




  constructor(
    private actions$: Actions,
    public translocoService: TranslocoService,
    private waiterCockpitService: WaiterCockpitService,
    private UsermanagementCockpitService: UsermanagementCockpitService,
    public snackBar: SnackBarService,
  ) { }
}
