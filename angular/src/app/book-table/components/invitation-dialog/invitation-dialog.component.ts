import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { BookTableService } from 'app/book-table/services/book-table.service';
import * as fromApp from 'app/store/reducers';
import { Store } from '@ngrx/store';
import * as bookTableActions from 'app/book-table/store/actions/book-table.actions';
import { Booking, ReservationInfo } from 'app/book-table/models/booking.model';
import { map } from 'lodash';

@Component({
  selector: 'app-public-invitation-dialog',
  templateUrl: './invitation-dialog.component.html',
  styleUrls: ['./invitation-dialog.component.scss'],
})
export class InvitationDialogComponent implements OnInit {
  data: Booking;
  date: string;

  constructor(
    private invitationService: BookTableService,
    private store: Store<fromApp.State>,
    private dialog: MatDialogRef<InvitationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) dialogData: any
  ) {
    this.data = {
      booking: {
        bookingDate: dialogData.bookingDate,
        name: dialogData.name,
        email: dialogData.email,
        bookingType: 1
      }, 
      invitedGuests: map(
        dialogData.invitedGuests,
        (email: string) => ({ email }),
      ),
    };
  }

  ngOnInit(): void {
    this.date = moment(this.data.booking.bookingDate).format('LLL');
  }

  sendInvitation(): void {
    this.store.dispatch(
      bookTableActions.inviteFriends({ booking: this.data }),
    );
    this.dialog.close(true);
  }
}