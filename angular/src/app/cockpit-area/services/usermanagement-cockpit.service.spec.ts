import { TestBed } from '@angular/core/testing';

import { UsermanagementCockpitService } from './usermanagement-cockpit.service';

describe('UsermanagementCockpitService', () => {
  let service: UsermanagementCockpitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsermanagementCockpitService);
  });

  /* TODO: admin-tests
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  */
});
