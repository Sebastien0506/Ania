import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinVocalComponent } from './join-vocal.component';

describe('JoinVocalComponent', () => {
  let component: JoinVocalComponent;
  let fixture: ComponentFixture<JoinVocalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoinVocalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JoinVocalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
