import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, from, of, Subject, switchMap, take, tap } from "rxjs";
import { Preferences } from '@capacitor/preferences'
import { Doc } from "../document.model";


const baseUrl = 'https://faq.herokuapp.com/'
const baseUrlL = 'http://localhost:3000/'

@Injectable({
  providedIn: 'root'
})
export class  ListService{
  documents: Doc[] = []
  docToSend!: Doc
  private allDocuments = new BehaviorSubject<any>(null)
  selectedDocs$ = this.allDocuments.asObservable()
  private selectedItemSource = new BehaviorSubject<any>(null);
  selectedItem$ = this.selectedItemSource.asObservable();

  constructor(private http: HttpClient){}


  fetchItems(){
    return from(Preferences.get({key: 'collDbNames'})).pipe(take(1), switchMap(datas =>{
      if(datas.value !== null){
        const params = datas.value ? JSON.parse(datas.value) : null
        return of(params)
      } else{
        return of(null)
      }
    }), switchMap(params=>{
      if(params !== null){
        return this.http.get<Doc[]>(`${baseUrlL}api/fetch-items`, {params: params})
      } else {
        return of(null)
      }
    }),tap(documents => {
      if(!documents){
        return
      }
      this.documents = documents
      this.allDocuments.next(documents)
    }))
  }


    toEdit(index: number){
      this.selectedItemSource.next(this.documents[index])
    }

}

