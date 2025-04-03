import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js';
import { AuthService } from '../service/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http'; // Import HttpClient and HttpParams

interface Pickup {
  pickupDate: string;
  selectedTime: string;
  selectedWaste: string;
  selectedRecyclables: string[];
  address: string;
}

@Component({
  selector: 'app-pick',
  templateUrl: './pick.component.html',
  styleUrls: ['./pick.component.css']
})
export class PickComponent implements OnInit {
  pickups: Pickup[] = [];
  filteredPickups: Pickup[] = [];
  wasteTypes: string[] = ['Household', 'Recyclable', 'Hazardous'];
  startDate: string = '';
  endDate: string = '';
  selectedWasteType: string = '';
  userId: string = ''; // Replace this with actual userId from session or token

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient // Inject HttpClient
  ) {}

  ngOnInit() {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.userId = userId;
      this.loadPickups();
      this.createChart();
    }
  }

  // Load pickups from the backend
  loadPickups() {
    const params = new HttpParams()
      .set('userId', this.userId)
      .set('startDate', this.startDate)
      .set('endDate', this.endDate)
      .set('wasteType', this.selectedWasteType);

    this.http.get<Pickup[]>('http://localhost:3000/api/schedules/pickups', { params })
      .subscribe(
        (data: Pickup[]) => {
          this.pickups = data;
          this.filteredPickups = [...this.pickups]; // Copy the data to filteredPickups
          this.updateChart();
        },
        (error) => {
          console.error('Error fetching pickups', error);
        }
      );
  }

  // Filter history based on selected filters
  filterHistory() {
    this.loadPickups(); // Reload data with filters
  }

  // Create chart to visualize pickups by type
  createChart() {
    const ctx = document.getElementById('pickupChart') as HTMLCanvasElement;
    const data = this.getChartData();

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Pickups by Type',
          data: data.values,
          backgroundColor: '#2ecc71',
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  // Update chart data when filtered pickups change
  updateChart() {
    const ctx = document.getElementById('pickupChart') as HTMLCanvasElement;
    const data = this.getChartData();

    const chartInstance = Chart.getChart(ctx);
    if (chartInstance) {
      chartInstance.data.labels = data.labels;
      chartInstance.data.datasets[0].data = data.values;
      chartInstance.update();
    }
  }

  // Get chart data for the pickup types
  private getChartData() {
    const labels = this.wasteTypes;
    const values = labels.map(type => this.filteredPickups.filter(pickup => pickup.selectedWaste === type).length);
    return { labels, values };
  }

  // Clear all applied filters
  clearFilters() {
    this.startDate = '';
    this.endDate = '';
    this.selectedWasteType = '';
    this.loadPickups(); // Reload data without filters
  }
}
