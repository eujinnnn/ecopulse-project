import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class notificationComponent implements OnInit {
  notifications: any[] = [];

  constructor(private http: HttpClient, private authService: AuthService) {} // Inject AuthService

  ngOnInit(): void {
    this.getNotifications();
  }

  getNotifications(): void {
    const userId = this.authService.getUserId(); // Get userId from AuthService
    if (userId) {
      // Make sure userId exists before making the request
      this.http.get<any[]>(`http://localhost:3000/api/notifications/${userId}`).subscribe(
        (data) => {
          this.notifications = data;
        },
        (error) => {
          console.error('Error fetching notifications', error);
        }
      );
    } else {
      console.error('User is not logged in, no userId available');
    }
  }
}
