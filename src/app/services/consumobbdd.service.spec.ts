import { TestBed } from '@angular/core/testing';

import { ConsumobbddService } from './consumobbdd.service';

describe('ConsumobbddService', () => {
  let service: ConsumobbddService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConsumobbddService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
