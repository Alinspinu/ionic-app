import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Preferences } from '@capacitor/preferences'
import { from, of, switchMap, take } from "rxjs";

const baseUrl = 'https://faq.herokuapp.com/';
const baseUrlL = 'http://localhost:3000/';

@Injectable({
  providedIn: 'root'
})
export class UpdateService{
  constructor(private http: HttpClient){}

  updateDoc(question: string, answer: string, _id: string){
    return from(Preferences.get({key:'collDbNames'}))
    .pipe(
      take(1),
      switchMap(datas => {
        if(datas.value !== null){
          const params = datas.value ? JSON.parse(datas.value) : null
          return of(params)
        } else{
          return of(null)
        }
      }), switchMap(params=>{
        if(params !== null){
        const doc = {question, answer, _id}
        return this.http.put(`${baseUrlL}api/edit-items`, doc, {params: params})
        } else {
          return of(null)
        }
      }))
  }

  addDoc(question: string, answer: string){
    return from(Preferences.get({key:'collDbNames'}))
    .pipe(
      take(1),
      switchMap(datas => {
        if(datas.value !== null){
          const params = datas.value ? JSON.parse(datas.value) : null
          return of(params)
        } else{
          return of(null)
        }
      }), switchMap(params=>{
        if(params !== null){
        const doc = {question, answer}
        return this.http.post(`${baseUrlL}api/new-item`, doc, {params: params})
        } else {
          return of(null)
        }
      }))
  }

  deleteDoc(id: string){
    console.log(id)
    return from(Preferences.get({key:'collDbNames'}))
    .pipe(
      take(1),
      switchMap(datas => {
        console.log(datas)
        if(datas.value !== null){
          const params = datas.value ? JSON.parse(datas.value) : null
          return of(params)
        } else{
          return of(null)
        }
      }), switchMap(params=>{
        return this.http.delete(`${baseUrlL}api/delete-item?id=`+ id, {params: params})
      }))
  }
}
