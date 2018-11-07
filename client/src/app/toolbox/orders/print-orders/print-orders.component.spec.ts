import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintOrdersComponent } from './print-orders.component';

describe('PrintOrdersComponent', () => {
  let component: PrintOrdersComponent;
  let fixture: ComponentFixture<PrintOrdersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintOrdersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
