import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EbayProductsComponent } from './ebay-products.component';

describe('EbayProductsComponent', () => {
  let component: EbayProductsComponent;
  let fixture: ComponentFixture<EbayProductsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EbayProductsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EbayProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
