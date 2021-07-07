import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Booking } from 'app/book-table/models/booking.model';
import { BookingTokenDialogComponent } from '../../components/booking-token-dialog/booking-token-dialog.component';
import * as moment from 'moment';
import * as fromApp from '../../../store/reducers';
import * as bookTableActions from '../../store/actions/book-table.actions';

@Component({
  selector: 'app-public-book-table-dialog',
  templateUrl: './book-table-dialog.component.html',
  styleUrls: ['./book-table-dialog.component.scss'],
})
export class BookTableDialogComponent implements OnInit {
  data: Booking;
  date: string;

  constructor(
    private store: Store<fromApp.State>,
    private dialog: MatDialogRef<BookTableDialogComponent>,
    private bookingTokenDialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) dialogData: any
  ) {
    this.data = {
      booking: {
        bookingDate: dialogData.bookingDate,
        name: dialogData.name,
        email: dialogData.email,
        assistants: dialogData.assistants,
        bookingType: 0
      }
    };
  }

  ngOnInit(): void {
    this.date = moment(this.data.booking.bookingDate).format('LLL');
  }

  sendBooking(): void {
    this.store.dispatch(bookTableActions.bookTable({booking: this.data}));
    this.dialog.close(true);
  }

  showBookingTokenDialog(): void {
    this.bookingTokenDialog
      .open(BookingTokenDialogComponent)
  }

}