import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EbayInventoryComponent } from './ebay-inventory.component';

describe('EbayInventoryComponent', () => {
  let component: EbayInventoryComponent;
  let fixture: ComponentFixture<EbayInventoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EbayInventoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EbayInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
