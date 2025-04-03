import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../service/auth.service';

interface PickupTime {
  time: string;
}

interface Community {
  name: string;
  pickupSchedule: { days: string; times: PickupTime[] }[];
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  notification: string = '';
  communityName: string = '';
  selectedDay1: string = '';
  selectedDay2: string = '';
  selectedTime: string = '';
  selectedTime2: string = '';
  availableDays: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']; // Add your available days
  availableTimes: string[] = ['10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM']; // Add your available times
  isModalVisible: boolean = false;

  communities: Community[] = [];

  constructor(private router: Router, private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.fetchCommunities();
  }

  getCurrentUser() {
    return this.authService.getCurrentUser();
  }

  fetchCommunities(): void {
    this.http.get<Community[]>('http://localhost:3000/api/communities')
      .subscribe(data => {
        this.communities = data;
      });
  }

  showCommunityModal() {
    this.isModalVisible = true;
  }

  closeCommunityModal() {
    this.isModalVisible = false;
  }

  getTimes(times: PickupTime[]): string {
    return times.map(t => t.time).join(', ');
  }

  addCommunity() {
    if (this.selectedDay1 === this.selectedDay2) {
      alert('You cannot select the same day for both pickups.');
      return;
    }
    if (this.selectedTime === this.selectedTime2) {
      alert('You cannot select the same time for both days.');
      return;
    }

    if (this.communityName && this.selectedDay1 && this.selectedDay2 && this.selectedTime && this.selectedTime2) {
      const newCommunity: Community = {
        name: this.communityName,
        pickupSchedule: [
          {
            days: this.selectedDay1,
            times: [{ time: this.selectedTime }, { time: this.selectedTime2 }]
          },
          {
            days: this.selectedDay2,
            times: [{ time: this.selectedTime }, { time: this.selectedTime2 }]
          }
        ]
      };

      // Send the new community to the backend
      this.http.post('http://localhost:3000/api/communities', newCommunity)
        .subscribe({
          next: (response) => {
            alert('Community added successfully!');
            console.log(response);
            this.fetchCommunities(); // Refresh the community list
            this.resetFields(); // Clear the form fields
          },
          error: (error) => {
            alert('Error adding community');
            console.error('There was an error!', error);
          }
        });
    } else {
      alert('Please fill in all fields.');
    }
  }

  resetFields() {
    this.communityName = '';
    this.selectedDay1 = '';
    this.selectedDay2 = '';
    this.selectedTime = '';
    this.selectedTime2 = '';
  }

  broadcastNotification() {
    if (this.notification) {
      const role = 'super admin';
      const community = '';

      const payload = { 
        message: this.notification, 
        role: role, 
        community: community 
      };

      this.http.post('http://localhost:3000/api/notifications', payload)
        .subscribe({
          next: (response) => {
            alert('Notification broadcasted!');
            console.log(response);
            this.notification = '';
          },
          error: (error) => {
            alert('Error broadcasting notification');
            console.error('There was an error!', error);
          }
        });
    } else {
      alert('Please enter a notification message.');
    }
  }
}
