import { Component, ViewChild, ElementRef } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../service/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

Chart.register(...registerables);

@Component({
  selector: 'app-generate',
  templateUrl: './generate.component.html',
  styleUrls: ['./generate.component.css']
})
export class GenerateComponent {
  selectedReport: string = '';
  startDate: string = '';
  endDate: string = '';
  reportMessage: string = '';
  chart: any;
  userId: string = '';
  userRole: string | null = null;

  reportOptions: string[] = [
    'Pickup Statistics',
    'Issues Reported',
    'Recycling Rates'
  ];

  @ViewChild('reportChart') reportChart!: ElementRef;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getRole();
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.userId = userId;
    }
  }

  onReportChange(event: Event): void {
    const inputElement = event.target as HTMLSelectElement;
    this.selectedReport = inputElement.value;
    console.log('Selected Report:', this.selectedReport);
  }

  generateReport(): void {
    if (!this.startDate || !this.endDate) {
      alert('Please specify both start and end dates.');
      return;
    }

    if (!this.selectedReport) {
      alert('Please select a report type.');
      return;
    }

    const start = new Date(this.startDate);
    const end = new Date(this.endDate);

    this.reportMessage = `Generating ${this.selectedReport} report from ${this.startDate} to ${this.endDate}.`;

    this.getReportData(this.selectedReport, start, end).subscribe(data => {
      if (data.values.length === 0) {
        alert('Insufficient data for the selected date range.');
        return;
      }

      if (this.chart) {
        this.chart.destroy();
      }

      const chartLabel = this.getChartLabel(this.selectedReport);

      this.createChart(data.labels, data.values, chartLabel);
    });
  }

  private getReportData(reportType: string, startDate: Date, endDate: Date): Observable<{ labels: string[], values: number[] }> {
    const params = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      userId: this.userId,
      userRole: this.userRole
    };

    if (reportType === 'Pickup Statistics') {
      return this.fetchPickupStatistics(params);
    } else if (reportType === 'Issues Reported') {
      return this.fetchIssuesReported(params);
    } else if (reportType === 'Recycling Rates') {
      return this.fetchRecyclingRates(params);
    }
    return new Observable(observer => observer.next({ labels: [], values: [] }));
  }

  private fetchPickupStatistics(params: any): Observable<{ labels: string[], values: number[] }> {
    return this.http.get<{ labels: string[], values: number[] }>(
      `http://localhost:3000/api/schedules/pickup-statistics`, { params }
    );
  }

  private fetchIssuesReported(params: any): Observable<{ labels: string[], values: number[] }> {
    return this.http.get<{ labels: string[], values: number[] }>(
      `http://localhost:3000/api/reports/issues-reported`, { params }
    );
  }

  private fetchRecyclingRates(params: any): Observable<{ labels: string[], values: number[] }> {
    return this.http.get<{ labels: string[], values: number[] }>(
      `http://localhost:3000/api/schedules/recycling-rates`, { params }
    );
  }

  private getChartLabel(reportType: string): string {
    if (reportType === 'Pickup Statistics') {
      return 'Waste Type';
    } else if (reportType === 'Issues Reported') {
      return 'Report Type';
    } else if (reportType === 'Recycling Rates') {
      return 'Recyclable Type';
    }
    return '';
  }

  private createChart(labels: string[], values: number[], chartLabel: string): void {
    const integerValues = values.map(value => Math.floor(value));

    const ctx = this.reportChart.nativeElement.getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: chartLabel,
          data: integerValues,
          backgroundColor: ['#4CAF50', '#8BC34A', '#388E3C '],
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }
}
