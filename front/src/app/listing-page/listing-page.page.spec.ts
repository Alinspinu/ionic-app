import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListingPagePage } from './listing-page.page';

describe('ListingPagePage', () => {
  let component: ListingPagePage;
  let fixture: ComponentFixture<ListingPagePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ListingPagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
