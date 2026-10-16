import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
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

    return this.http.get<AvanceResponse>(this.apiUrl, { params }).pipe(catchError(this.handleError));
  }

  obtenerDistritos(): Observable<ItemSelector[]> {
    return this.http.get<ItemSelector[]>(`${this.apiUrl}/distritos`).pipe(catchError(this.handleError));
  }

  obtenerTiposEleccion(): Observable<ItemSelector[]> {
    return this.http.get<ItemSelector[]>(`${this.apiUrl}/tipos-eleccion`).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let mensajeError = 'Ocurrió un error inesperado.';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente o de red
      mensajeError = `Error de red: ${error.error.message}`;
    } else {
      // El backend retornó un código de error HTTP
      switch (error.status) {
        case 0:
          mensajeError = 'El servicio no está disponible. Verifica tu conexión a internet o si el servidor está encendido.';
          break;
        case 500:
          mensajeError = 'Error interno del servidor (500). Por favor, inténtalo más tarde.';
          break;
        case 400:
          mensajeError = 'Solicitud incorrecta. Revisa los filtros enviados.';
          break;
        default:
          mensajeError = `Error código ${error.status}: ${error.message}`;
          break;
      }
    }

    console.error('Detalle del error:', error);
    // Retornamos un Observable con el mensaje amigable listo para mostrarse
    return throwError(() => new Error(mensajeError));
  }
}