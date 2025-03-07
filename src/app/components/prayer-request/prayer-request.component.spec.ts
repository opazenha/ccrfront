import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrayerRequestComponent } from './prayer-request.component';

describe('PrayerRequestComponent', () => {
  let component: PrayerRequestComponent;
  let fixture: ComponentFixture<PrayerRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrayerRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrayerRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
