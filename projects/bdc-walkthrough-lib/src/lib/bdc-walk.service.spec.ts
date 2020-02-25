import { TestBed } from '@angular/core/testing';

import { BdcWalkService } from './bdc-walk.service';

describe('BdcWalkService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BdcWalkService = TestBed.get(BdcWalkService);
    expect(service).toBeTruthy();
  });
});
