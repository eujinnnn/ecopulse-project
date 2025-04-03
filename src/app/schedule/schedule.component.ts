import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../service/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit {
  selectedTime: string = '';
  selectedWaste: string = '';
  selectedRecyclables: string[] = [];
  pickupDate: string = '';
  address: string = '';
  communityName: string = '';
  pickupSchedule: any[] = [];
  userId: string = '';
  minDate: string = new Date().toISOString().split('T')[0]; // to store minimum selectable date
  availableTimes: { time: string }[] = [];
  availableDays: string[] = [];

  wasteOptions: string[] = [
    'household waste',
    'recyclable waste',
    'hazardous waste'
  ];

  recyclableOptions: string[] = [
    'paper',
    'plastic',
    'aluminium'
  ];

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.userId = userId;
      this.fetchPickupSchedule();
      this.fetchUserProfile(userId);
    }
  }

  fetchUserProfile(userId: string): void {
    this.http.get<any>(`http://localhost:3000/api/user/${userId}`).subscribe({
      next: (data) => {
        this.address = data.address;
      },
      error: (err) => console.error('Error fetching user data', err)
    });
  }

  fetchPickupSchedule(): void {
    const apiUrl = `http://localhost:3000/api/user/pickup-schedule/${this.userId}`;
    this.http.get<any>(apiUrl).subscribe(
      (response) => {
        if (response && response.pickupSchedule) {
          this.pickupSchedule = response.pickupSchedule;
          this.extractAvailableDays();
        } else {
          console.error('No pickup schedule available.');
        }
      },
      (error) => {
        console.error('Error fetching pickup schedule:', error);
        alert('There was an error fetching your pickup schedule.');
      }
    );
  }

  extractAvailableDays(): void {
    this.availableDays = [];
    this.pickupSchedule.forEach(schedule => {
      if (!this.availableDays.includes(schedule.days)) {
        this.availableDays.push(schedule.days);
      }
    });
  }

  onDateChange(event: any): void {
    const date = event.target.value;
    this.pickupDate = date;

    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
    
    this.filterAvailableTimes(dayOfWeek);
  }

  filterAvailableTimes(dayOfWeek: string): void {
    this.availableTimes = [];
    
    this.pickupSchedule.forEach(schedule => {
      if (schedule.days.toLowerCase() === dayOfWeek) {
        this.availableTimes = schedule.times;
      }
    });

    if (this.availableTimes.length === 0) {
      alert('No available pickup times for the selected day.');
    }
    console.log('Available Times:', this.availableTimes);
  }

  onTimeChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedTime = selectElement.value;
    console.log('Selected Time:', this.selectedTime);
  }  

  onWasteChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedWaste = selectElement.value;
    this.selectedRecyclables = [];
    console.log('Selected Waste:', this.selectedWaste);
  }

  onRecyclableChange(recyclable: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      this.selectedRecyclables.push(recyclable);
    } else {
      this.selectedRecyclables = this.selectedRecyclables.filter(item => item !== recyclable);
    }
    console.log('Selected Recyclables:', this.selectedRecyclables);
  }

  isValidDate(date: string): boolean {
    const currentDate = new Date();
    const selectedDate = new Date(date);
    return selectedDate >= currentDate;
  }

  clearForm(): void {
    this.selectedTime = '';
    this.selectedWaste = '';
    this.selectedRecyclables = [];
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
    if (dateInput) {
      dateInput.value = '';
    }
  }

  schedulePickup(): void {
    if (!this.selectedWaste || !this.selectedTime || !this.pickupDate) {
      alert('Please fill in all fields: date, time, and waste type.');
      return;
    }
  
      const pickupData = {
        userId: this.userId,
        selectedWaste: this.selectedWaste,
        selectedTime: this.selectedTime,
        pickupDate: this.pickupDate,
        selectedRecyclables: this.selectedRecyclables,
        address: this.address
      };      
  
    this.http.post('http://localhost:3000/api/pickup', pickupData).subscribe({
      next: (response) => {
        alert(`Your pickup is scheduled successfully!\n\n` +
              `Waste Type: ${this.selectedWaste}\n` +
              `Pickup time: ${this.selectedTime}\n` +
              `Pickup date: ${this.pickupDate}\n` +
              `Pickup location: ${this.address}`);
        
        this.clearForm();
      },
      error: (error) => {
        console.error('Error scheduling pickup:', error);
        alert('There was an error scheduling your pickup. Please try again later.');
      }
    });
  }  
}
