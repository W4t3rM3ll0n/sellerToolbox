import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EbayActiveComponent } from './ebay-active.component';

describe('EbayActiveComponent', () => {
  let component: EbayActiveComponent;
  let fixture: ComponentFixture<EbayActiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EbayActiveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EbayActiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
