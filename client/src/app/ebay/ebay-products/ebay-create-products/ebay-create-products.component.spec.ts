import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EbayCreateProductsComponent } from './ebay-create-products.component';

describe('EbayCreateProductsComponent', () => {
  let component: EbayCreateProductsComponent;
  let fixture: ComponentFixture<EbayCreateProductsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EbayCreateProductsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EbayCreateProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
