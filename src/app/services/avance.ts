import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AvanceResponse, ItemSelector } from '../models/avance.interface';

@Injectable({
  providedIn: 'root'
})
export class AvanceService {
  private apiUrl = 'http://localhost:3000/avance';

  constructor(private http: HttpClient) {}

  obtenerAvance(distritoId?: number, tipoEleccionId?: number): Observable<AvanceResponse> {
    let params = new HttpParams();
    if (distritoId) {
      params = params.set('distritoId', distritoId.toString());
    }
    if (tipoEleccionId) {
      params = params.set('tipoEleccionId', tipoEleccionId.toString());
    }

    return this.http.get<AvanceResponse>(this.apiUrl, { params });
  }

  obtenerDistritos(): Observable<ItemSelector[]> {
    return this.http.get<ItemSelector[]>(`${this.apiUrl}/distritos`);
  }

  obtenerTiposEleccion(): Observable<ItemSelector[]> {
    return this.http.get<ItemSelector[]>(`${this.apiUrl}/tipos-eleccion`);
  }
}