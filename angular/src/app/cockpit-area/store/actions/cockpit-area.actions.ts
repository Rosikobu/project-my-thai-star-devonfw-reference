import { createAction, props, union } from '@ngrx/store';
import { OrderStatus } from 'app/cockpit-area/models/orders';
import { UserInfo } from '../../../shared/backend-models/interfaces';


export const createUser = createAction(
  '[createUser] createUser ',
  props<{UserInfo :UserInfo }>(),
);

export const createUserSuccess = createAction(
  '[createUser] createUser success',
  props< UserInfo >(),
);

export const createUserFail = createAction(
  '[createUser] createUser Fail',
  props<{ error: Error }>(),
);

export const updateUser = createAction(
  '[updateUser] updateUser ',
  props<{UserInfo :UserInfo }>(),
);

export const updateUserSuccess = createAction(
  '[updateUser] updateUser success',
  
);

export const updateUserFail = createAction(
  '[updateUser] updateUser Fail',
  props<{ error: Error }>(),
);

export const deleteUser = createAction(
  '[deleteUser] deleteUser ',
  props<{UserInfo :UserInfo }>(),
);

export const deleteUserSuccess = createAction(
  '[deleteUser] deleteUser success'
);

export const deleteUserFail = createAction(
  '[deleteUser] deleteUser Fail',
  props<{ error: Error }>(),
);
export const resetUserPassword = createAction(
  '[resetUserPassword] resetUserPassword ',
  props<{Email :String }>(),
);

export const resetUserPasswordSuccess = createAction(
  '[resetUserPassword] resetUserPassword success',
);

export const resetUserPasswordFail = createAction(
  '[resetUserPassword] resetUserPassword Fail',
  props<{ error: Error }>(),
);
export const updatePaymentStatus = createAction(
  '[updatePaymentStatus] updatePaymentStatus ',
  props<{order : OrderStatus }>(),
);

export const updatePaymentStatusSuccess = createAction(
  '[updatePaymentStatus] updatePaymentStatus success',
);

export const updatePaymentStatusFail = createAction(
  '[updatePaymentStatus] updatePaymentStatus Fail',
  props<{ error: Error }>(),
);
export const updateOrderStatus = createAction(
  '[updateOrderStatus] updateOrderStatus ',
  props<{order : OrderStatus }>(),
);

export const updateOrderStatusSuccess = createAction(
  '[updateOrderStatus] updateOrderStatus success',
);

export const updateOrderStatusFail = createAction(
  '[updateOrderStatus] updateOrderStatus Fail',
  props<{ error: Error }>(),
);
export const cancelOrder = createAction(
  '[cancelOrder] cancelOrder ',
  props<{id : number }>(),
);

export const cancelOrderSuccess = createAction(
  '[cancelOrder] cancelOrder success',
);

export const cancelOrderFail = createAction(
  '[cancelOrder] cancelOrder Fail',
  props<{ error: Error }>(),
);
// action types
const all = union({
  createUser,
  createUserSuccess,
  createUserFail,
  updateUser,
  updateUserSuccess,
  updateUserFail,
  deleteUser,
  deleteUserSuccess,
  deleteUserFail,
  resetUserPassword,
  resetUserPasswordSuccess,
  resetUserPasswordFail,
  updatePaymentStatus,
  updatePaymentStatusSuccess,
  updatePaymentStatusFail,
  updateOrderStatus,
  updateOrderStatusSuccess,
  updateOrderStatusFail,
  cancelOrder,
  cancelOrderSuccess,
  cancelOrderFail
});
export type CockpitAreaActions = typeof all;
