import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UpdatePagePage } from './update-page.page';

describe('UpdatePagePage', () => {
  let component: UpdatePagePage;
  let fixture: ComponentFixture<UpdatePagePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(UpdatePagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
