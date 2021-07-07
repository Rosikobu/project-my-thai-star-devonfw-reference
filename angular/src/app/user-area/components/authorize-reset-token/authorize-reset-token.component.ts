import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { UserAreaService } from "../../services/user-area.service"

@Component({
  selector: 'app-authorize-reset-token',
  templateUrl: './authorize-reset-token.component.html',
  styleUrls: ['./authorize-reset-token.component.scss']
})
export class AuthorizeResetTokenComponent implements OnInit {
  token: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private userAreaService: UserAreaService,
  ) {
    this.activatedRoute.queryParams.subscribe(params => {
      this.token = params['token'];
      this.navigatToResetPassword();
    });
  }
  ngOnInit(): void { }

  navigatToResetPassword(): void {
    this.userAreaService.checkToken(this.token).subscribe(
      data => this.router.navigate(['resetPassword'], { queryParams: { token: this.token } }),
      error => this.router.navigate(['restaurant'])
    );
  }
}
