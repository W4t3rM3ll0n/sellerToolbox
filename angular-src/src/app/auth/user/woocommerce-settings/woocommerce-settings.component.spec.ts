import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WoocommerceSettingsComponent } from './woocommerce-settings.component';

describe('WoocommerceSettingsComponent', () => {
  let component: WoocommerceSettingsComponent;
  let fixture: ComponentFixture<WoocommerceSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WoocommerceSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WoocommerceSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
