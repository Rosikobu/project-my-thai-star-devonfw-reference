import {
  Component,
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
  FilterAdminCockpit,
  Pageable,
  Sort,
  UserInfo,
} from '../../shared/backend-models/interfaces';
import { TextLabel } from '../../shared/view-models/interfaces';
import { UsermanagementCockpitService } from '../services/usermanagement-cockpit.service';
import { NewUserDialogComponent } from './new-user-dialog/new-user-dialog.component';
import { UserDetailsDialogComponent } from './user-details-dialog/user-details-dialog.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { UserPasswordDialogComponent } from './user-password-dialog/user-password-dialog.component';
import { AuthService } from 'app/core/authentication/auth.service';
import { SnackBarService } from '../../core/snack-bar/snack-bar.service';

@Component({
  selector: 'app-usermanagement-cockpit',
  templateUrl: './usermanagement-cockpit.component.html',
  styleUrls: ['./usermanagement-cockpit.component.scss']
})
export class UsermanagementCockpitComponent implements OnInit {
  @ViewChild('pagingBar', { static: true }) pagingBar: MatPaginator;
  private translocoSubscription = Subscription.EMPTY;
  private pageable: Pageable = {
    pageSize: 8,
    pageNumber: 0,
  };
  private sorting: Sort[] = [];
  pageSize = 8;
  users: UserInfo[] = [];
  totalOrders: number;
  columns: TextLabel[];
  displayedColumns: string[] = [
    'username',
    'email',
    'userRole',
    'Avatar'//@patric please change 
  ];
  currentUser;
  pageSizes: number[];
  filters: FilterAdminCockpit = {
    username: '',
    email: '',
    userRole: undefined
  };
  roles: string[];

  constructor(
    private dialog: MatDialog,
    public snackBar: SnackBarService,
    private authService: AuthService,
    private translocoService: TranslocoService,
    private UsermanagementCockpitService: UsermanagementCockpitService,
    private configService: ConfigService,
  ) {
    this.pageSizes = this.configService.getValues().pageSizes;
  }

  ngOnInit(): void {
    this.applyFilters();
    this.authService.getUser().subscribe((username) => {
      this.currentUser = username;
    });
    this.translocoService.langChanges$.subscribe((event: any) => {
      this.setTableHeaders(event);
      moment.locale(this.translocoService.getActiveLang());

    });
  }

  setTableHeaders(lang: string): void {
    this.translocoSubscription = this.translocoService
      .selectTranslateObject('cockpit.userTable', {}, lang)
      .subscribe((cockpitUserTable) => {
        this.columns = [
          { name: 'username', label: cockpitUserTable.userName },
          { name: 'email', label: cockpitUserTable.emailH },
          { name: 'userRole', label: cockpitUserTable.userRole },
          { name: 'Avatar', label: cockpitUserTable.Avatar },//@patric please change 
        ];

      });
    this.translocoSubscription = this.translocoService
      .selectTranslateObject('userManagement', {}, lang)
      .subscribe((userManagement) => {
        this.roles = [
          userManagement.roleCustomer,
          userManagement.roleWaiter,
          userManagement.roleManager,
          userManagement.roleAdmin
        ];
      });
  }


  applyFilters(): void {
    this.UsermanagementCockpitService.getUsers(this.pageable, this.sorting)
      .subscribe((data: any) => {
        this.users = data.content;
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
    } this.applyFilters();
  }

  ngOnDestroy(): void {
    this.translocoSubscription.unsubscribe();
  }

  handelPasswordDialog(userInfo: UserInfo): void {
    let dialogRef = this.dialog.open(UserPasswordDialogComponent, {
      data: userInfo
    });
    dialogRef.afterClosed().subscribe(() => setTimeout(() => this.applyFilters(), 300));  
  }
    getUserRoleText(user : UserInfo){
      return this.roles[user.userRoleId];
  }

  handelNewUserDialog(): void {
    let dialogRef = this.dialog.open(NewUserDialogComponent, {
      width : "30%"
    });
    dialogRef.afterClosed().subscribe(() => setTimeout(() => this.applyFilters(), 300)); 
  }

  handelconfirmationDailog(userInfo: UserInfo) :void {
    if (userInfo) {
    let dialog = this.dialog.open(ConfirmationDialogComponent, { data: userInfo });
    dialog.afterClosed().subscribe(() => setTimeout(() => this.applyFilters(), 300)); 
    }else{
      setTimeout(() => this.applyFilters(), 300); 
    }
  }

  handelUserDetailsDialog(userInfo: UserInfo): void {
    let dialogRef = this.dialog.open(UserDetailsDialogComponent, { data: userInfo });
    dialogRef.afterClosed().subscribe((data) => this.handelconfirmationDailog(data));
  }

}
