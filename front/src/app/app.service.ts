import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Preferences } from '@capacitor/preferences'
import { from, of, switchMap, take} from "rxjs";
import { ListService } from "./listing-page/listing.service";

const baseUrl = 'https://faq.herokuapp.com/'
const baseUrlL = 'http://localhost:3000/'

@Injectable({
  providedIn: "root"
})
export class AppService {

  constructor(private http: HttpClient, private listServ: ListService){}

  createDb(data: {dbName: string, collName: string}){
     return this.http.post(`${baseUrlL}api/createDb`, data)
  }

  uploadBatchFiles(data: [{question: string, answer: string}]){
     return from(Preferences.get({key: 'collDbNames'}))
     .pipe(
     take(1),
     switchMap((datas => {
      if(datas.value !== null){
        const params = datas.value ? JSON.parse(datas.value) : null
        return of(params)
      } else{
        return of(null)
      }
     })),
     switchMap(params => {
      if(params !== null){
        return this.http.post(`${baseUrlL}api/upload-batch`, data, {params: params})
      } else {
        return of(null)
      }
     }))
     }

     deleteAll(){
      return from(Preferences.get({key: 'collDbNames'}))
      .pipe(
        take(1),
        switchMap((datas)=>{
          if(datas.value !== null){
            const params = datas.value ? JSON.parse(datas.value) : null
            return of(params)
          } else{
            return of(null)
          }
      }),
      switchMap(params =>{
        if(params !== null){
        return this.http.delete(`${baseUrlL}api/deleteAll`, {params: params})
      } else {
        return of(null)
      }
      })
      )}

}

