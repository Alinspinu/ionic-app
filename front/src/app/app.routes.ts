import { NgModule } from '@angular/core';
import { PreloadAllModules, Route, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'main-page',
    pathMatch: 'full',
  },
  {
    path: 'main-page',
    loadComponent: () => import('./main-page/main-page.page').then((m)=> m.MainPagePage)
  },
  {
    path: 'listing-page',
    loadComponent: () => import('./listing-page/listing-page.page').then((m) => m.ListingPagePage)
  },
  {
    path: 'update-page',
    loadComponent: () => import('./update-page/update-page.page').then((m) => m.UpdatePagePage),

  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
