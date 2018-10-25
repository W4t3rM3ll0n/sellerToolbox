import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EbaySettingsComponent } from './ebay-settings.component';

describe('EbaySettingsComponent', () => {
  let component: EbaySettingsComponent;
  let fixture: ComponentFixture<EbaySettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EbaySettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EbaySettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
