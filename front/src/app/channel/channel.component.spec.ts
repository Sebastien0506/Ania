import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChannelComponent } from './channel.component';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
// import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('ChannelComponent', () => {
  let component: ChannelComponent;
  let fixture: ComponentFixture<ChannelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), ChannelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should show modal if message is empty', () => {
    component.messageText = '';
    component.validate_input();
    expect(component.showModal).toBeTrue();
  });

  it('should show modal if message contains forbidden character', () => {
    component.messageText = 'Hello@';
    component.validate_input();
    expect(component.showModal).toBeTrue();
  });

  it('should NOT show modal if message is valid', () => {
    component.messageText = 'Hello 123.';
    component.showModal = false;
    component.validate_input();
    expect(component.showModal).toBeFalse();
  });
});
