import {ActionReducerMap} from '@ngrx/store';
import * as fromBooking from './cockpit-area.reducer';
import * as FromCockpitArea from './cockpit-area.reducer';

export  interface BookTableState {
  user: FromCockpitArea.State;
}

export const reducers: ActionReducerMap<BookTableState> = {
  user: FromCockpitArea.reducer,
};
