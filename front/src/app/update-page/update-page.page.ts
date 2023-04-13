import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Form, FormsModule, NgForm } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { ListService } from '../listing-page/listing.service';

import { UpdateService } from './update.service';
import { take, tap } from 'rxjs';

@Component({
  selector: 'app-update-page',
  templateUrl: './update-page.page.html',
  styleUrls: ['./update-page.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class UpdatePagePage implements OnInit {
  isDocument = false
  document: any = {}

  constructor(private listServ: ListService, private updateSrv: UpdateService, private toastCtrl: ToastController) { }

  ngOnInit() {
    this.listServ.selectedItem$.subscribe(item => {
      if(item){
        this.isDocument = true
        this.document = item
        console.log(this.document)
      } else {
        this.isDocument = false
        this.document = {_id: '', question: '', answer: ''}
    }
    })
  }

  onEdit(question: any, answer: any){
    this.updateSrv.updateDoc(question, answer, this.document._id).subscribe(message => {
     const mess = JSON.stringify(message)
     this.isDocument = false
      return this.showToast(this.toastCtrl, mess, 3000)
    }
    )
    console.log(question, answer)
  }

  onSubmit(form: NgForm){
    const question = form.value.question
    const answer = form.value.answer
    this.updateSrv.addDoc(question, answer).pipe(take(1), tap((response: any) => {
      if(response !== null ){
        this.listServ.documents.push({question: question, answer: answer, _id: response.id})
      }
    })).subscribe((message: any) => {
      if(message !== null) {
        const mess = JSON.stringify(message.message)
        form.reset()
        return this.showToast(this.toastCtrl, mess, 3000)
      } else {
        form.reset()
        return this.showToast(this.toastCtrl, 'Before uploading a file you have to create a database and a collection', 3000)
      }
    })

  }

  onDelete(){
    return this.updateSrv.deleteDoc(this.document._id).subscribe(message => {
      const mess = JSON.stringify(message)
      this.isDocument = false
       return this.showToast(this.toastCtrl, mess, 3000)
     }
     )
  }

  private async showToast(toastCtrl: ToastController, message: string, duration: number) {
    const toast = await toastCtrl.create({
      message: message,
      duration: duration
    });
    toast.present();
  }
}
