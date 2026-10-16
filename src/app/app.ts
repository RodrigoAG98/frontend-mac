import { Component, signal, inject, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ProgressBarModule } from 'primeng/progressbar';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { TagModule } from 'primeng/tag';

import { AvanceService } from './services/avance';
import { AvanceResponse, ItemSelector } from './models/avance.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer, switchMap } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    TableModule,
    ProgressBarModule,
    ButtonModule,
    ChartModule,
    TagModule,
    SelectModule
  ],
  templateUrl: './app.html'
})
export class App {
  private destroyRef = inject(DestroyRef);
  distritos: ItemSelector[] = [];
  tiposEleccion: ItemSelector[] = [];

  selectedDistrito: number | null = null;
  selectedTipoEleccion: number | null = null;

  datosAvance = signal<AvanceResponse>({
    resumenGeneral: { actasEsperadas: 0, capturadas: 0, pendientes: 0, porcentajeAvance: 0 },
    detalleDistritos: [],
    detalleTiposEleccion: []
  });

  COLOR_PALETTE = [
    { capturada: '#2563eb', pendiente: 'rgba(37, 99, 235, 0.3)' },  // Azul (Fuerte / Tenue)
    { capturada: '#7c3aed', pendiente: 'rgba(124, 58, 237, 0.3)' }, // Violeta (Fuerte / Tenue)
    { capturada: '#059669', pendiente: 'rgba(5, 150, 105, 0.3)' },  // Verde (Fuerte / Tenue)
  ];
  cargando = true;

  // Configuración de la gráfica de barras
  chartData = computed(() => {
    const detalle = this.datosAvance().detalleDistritos;
    
    const labels = detalle.map(d => d.distrito);
    const capturadas = detalle.map(d => d.capturadas);
    const pendientes = detalle.map(d => d.pendientes);

    return {
      labels: labels,
      datasets: [
        {
          label: 'Capturadas',
          backgroundColor: '#22c55e',
          data: capturadas
        },
        {
          label: 'Pendientes',
          backgroundColor: '#f97316',
          data: pendientes
        }
      ]
    };
  });

  // Computed Signal que genera la data para las gráficas de pastel individuales
chartListTipoEleccion = computed(() => {
  const detalle = this.datosAvance().detalleTiposEleccion || [];

  return detalle.map((t, index) => {
    // Asignar color según el índice o tipo de elección
    const colors = this.COLOR_PALETTE[index % this.COLOR_PALETTE.length];

    return {
      titulo: t.tipoEleccion,
      porcentaje: t.porcentajeAvance,
      data: {
        labels: ['Capturadas', 'Pendientes'],
        datasets: [
          {
            data: [t.capturadas, t.pendientes],
            backgroundColor: [colors.capturada, colors.pendiente],
            borderColor: [colors.capturada, colors.capturada],
            borderWidth: 1
          }
        ]
      },
      chartPieOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              font: { size: 11 }
            }
          }
        }
      }
    };
  });
});
  
  chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#495057'
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          ticks: { color: '#495057' },
          grid: { color: '#ebedef' }
        },
        y: {
          stacked: true,
          ticks: { color: '#495057' },
          grid: { color: '#ebedef' }
        }
      }
    };

  private avanceService = inject(AvanceService);

  ngOnInit() {
    this.cargarCatalogos();
    this.iniciarPollingAuto();
  }

  cargarCatalogos() {
    this.avanceService.obtenerDistritos().subscribe(data => (this.distritos = data));
    this.avanceService.obtenerTiposEleccion().subscribe(data => (this.tiposEleccion = data));
  }

  iniciarPollingAuto() {
    timer(0, 30000)
      .pipe(
        switchMap(() => {
          this.cargando = true;
          return this.avanceService.obtenerAvance(
            this.selectedDistrito ?? undefined, 
            this.selectedTipoEleccion ?? undefined
          );
        }),
        takeUntilDestroyed(this.destroyRef) // Detiene el timer si el usuario navega a otra pantalla
      )
      .subscribe({
        next: (response) => {
          this.datosAvance.set(response);
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al actualizar datos automáticamente:', err);
          this.cargando = false;
        }
      });
  }

  consultarAvance() {
    this.cargando = true;
    this.avanceService
      .obtenerAvance(this.selectedDistrito ?? undefined, this.selectedTipoEleccion ?? undefined)
      .subscribe({
        next: (response) => {
          this.datosAvance.set(response);
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al cargar datos:', err);
          this.cargando = false;
        }
      });
  }

  limpiarFiltros() {
    this.selectedDistrito = null;
    this.selectedTipoEleccion = null;
    this.consultarAvance();
  }
}
