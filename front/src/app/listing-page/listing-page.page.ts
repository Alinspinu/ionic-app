import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { ListService } from './listing.service';
import { Doc } from '../document.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-listing-page',
  templateUrl: './listing-page.page.html',
  styleUrls: ['./listing-page.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})

export class ListingPagePage implements OnInit {

  documents: Doc[] =[]

  constructor(private listService: ListService, private toastCtrl: ToastController) { }

  ngOnInit() {
    this.listService.fetchItems().subscribe(response =>{
      if(response !== null){
       return this.documents = response
      } else {
        return this.showToast(this.toastCtrl, 'Nothing to show go upload some files!', 4000)
      }

    }
    )

  }

  toEdit(index: number){
    this.listService.toEdit(index)
  }


  private async showToast(toastCtrl: ToastController, message: string, duration: number) {
    const toast = await toastCtrl.create({
      message: message,
      duration: duration
    });
    toast.present();
  }
}
