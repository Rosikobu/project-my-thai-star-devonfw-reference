import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorizeResetTokenComponent } from './authorize-reset-token.component';

describe('AuthorizeResetTokenComponent', () => {
  let component: AuthorizeResetTokenComponent;
  let fixture: ComponentFixture<AuthorizeResetTokenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthorizeResetTokenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthorizeResetTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /*TODO
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  */
});
