import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AlertController, IonicModule, IonLabel, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { AppService } from '../app.service';
import { from, map, Observable, Subscription } from 'rxjs';
import { Preferences } from '@capacitor/preferences'

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.page.html',
  styleUrls: ['./main-page.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class MainPagePage implements OnInit, OnDestroy {

  selectedFile: File | null = null;
  fileReader: FileReader = new FileReader();
  jsonData!: [{question: string, answer: string}];
  dbName!: string
  collName!: string
  isFunctionDisabled: boolean = true
  uploadSub!: Subscription


  @ViewChild('filePicker') filePickerRef!: ElementRef<HTMLInputElement>

  constructor(private http: HttpClient,
    private appService: AppService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    ) { }

  ngOnInit() {
    Preferences.get({key: 'collDbNames'}).then( data => {
      console.log(data)
    })

  }


sendData(filePicker: HTMLInputElement){
  const file = this.filePickerRef.nativeElement.files
  const label = document.getElementById('file-label');
  if(file && file[0] && label){
    this.fileReader.readAsText(file[0]);
    this.fileReader.onload = (event) => {
      this.jsonData = JSON.parse(this.fileReader.result as string);
      this.uploadSub = this.appService.uploadBatchFiles(this.jsonData).subscribe(res=>{
        if(res !== null){
          const message = JSON.stringify(res)
          filePicker.value = ''
          label.innerText = ''
          this.selectedFile = null
          return this.showToast(this.toastCtrl, message, 3000)
        } else {
          return this.showToast(this.toastCtrl, 'Before uploading the files you have to create a database and a collection!', 3000)
        }

      })
    };
  }
}

  onSubmit(form: NgForm){
    const data = { dbName: this.dbName, collName: this.collName };
      const jsonData = JSON.stringify(data)
      Preferences.set({key: 'collDbNames', value: jsonData})
    this.appService.createDb(data).subscribe(res => {
      form.reset()
      this.isFunctionDisabled = false
    })
  }

  onFileSelected(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement && inputElement.files && inputElement.files[0]) {
      const file = inputElement.files[0];
      const label = document.getElementById('file-label');
      this.selectedFile = file
      if(label){
        label.innerText = file.name;
      }
    } else{
      this.selectedFile = null
    }
  }

  onFilePick(){
    this.filePickerRef.nativeElement.click()
}

deleteAllData(){
  this.showAlert()

}

ngOnDestroy(): void {
  if(this.uploadSub){
    this.uploadSub.unsubscribe()
  }
}

private async showToast(toastCtrl: ToastController, message: string, duration: number) {
  const toast = await toastCtrl.create({
    message: message,
    duration: duration
  });
  toast.present();
}

 private async showAlert() {
  const alert = await this.alertCtrl.create({
    header: 'Delete All Documents',
    message: 'Are you sure you want to delete all documents?',
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
      },
      {
        text: 'Delete All',
        handler: () => {
          return this.appService.deleteAll().subscribe(res => {
            if(res !== null) {
            const message = JSON.stringify(res)
            return this.showToast(this.toastCtrl, message, 3000)
          } else {
            return this.showToast(this.toastCtrl, 'Nothig to delete, you need to add a database and a collection first!', 3000)
          }
          }

          )
        }
      }
    ]
  });

  await alert.present();
}


private checkCollDbNames(): Observable<boolean> {
  return from(Preferences.get({key: 'collDbNames'})).pipe(
    map(result => result.value !== null)
  );
}
}
