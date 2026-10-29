import { TestBed } from '@angular/core/testing';

import { JoinVocalService } from './join-vocal.service';

describe('JoinVocalService', () => {
  let service: JoinVocalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JoinVocalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
