import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { CoreModule } from '../core/core.module';
import { SnackBarService } from '../core/snack-bar/snack-bar.service';
import { WindowService } from '../core/window/window.service';
import { SharedModule } from '../shared/shared.module';
import { BookTableDialogComponent } from './components/book-table-dialog/book-table-dialog.component';
import { BookingTokenDialogComponent } from './components/booking-token-dialog/booking-token-dialog.component';
import { InvitationDialogComponent } from './components/invitation-dialog/invitation-dialog.component';
import { BookTableComponent } from './container/book-table/book-table.component';
import { BookTableService } from './services/book-table.service';
import { reducers, effects } from './store';
import { TranslocoRootModule } from '../transloco-root.module';
import {ClipboardModule} from "@angular/cdk/clipboard"

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    HttpClientModule,
    TranslocoRootModule,
    CoreModule,
    StoreModule.forFeature('bookTable', reducers),
    EffectsModule.forFeature(effects),
    ClipboardModule
  ],
  providers: [BookTableService, WindowService, SnackBarService],
  declarations: [
    InvitationDialogComponent,
    BookTableComponent,
    BookTableDialogComponent,
    BookingTokenDialogComponent,
  ],
  exports: [BookTableComponent],
  entryComponents: [InvitationDialogComponent, BookTableDialogComponent],
})
export class BookTableModule {}
