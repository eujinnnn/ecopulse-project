import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  name: string = '';
  email: string = '';
  contact: string = '';
  community: string = '';
  address: string = '';
  role: string = '';
  userId: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.userId = userId;
      this.fetchUserProfile(userId);
    } else {
      this.resetForm();
    }

    const navigation = this.router.getCurrentNavigation();
    const updatedProfile = navigation?.extras?.state?.['profile'];
    if (updatedProfile) {
      this.populateForm(updatedProfile);
    }
  }

  resetForm(): void {
    this.name = '';
    this.email = '';
    this.contact = '';
    this.community = '';
    this.address = '';
    this.role = '';
    this.userId = '';
  }

  populateForm(profile: any): void {
    this.name = profile.name;
    this.email = profile.email;
    this.contact = profile.contactNumber;
    this.community = profile.community && profile.community.name ? profile.community.name : profile.community || ''; 
    this.address = profile.address;
    this.role = profile.role;
    this.userId = profile.id;
  }
  
  
  fetchUserProfile(userId: string): void {
    this.http.get<any>(`http://localhost:3000/api/user/${userId}`).subscribe({
      next: (data) => {
        this.name = data.username;
        this.email = data.email;
        this.contact = data.contact;
        this.community = data.community && data.community.name ? data.community.name : data.community || ''; 
        this.address = data.address;
        this.role = data.role;
      },
      error: (err) => console.error('Error fetching user data', err)
    });
  }  

  navigateToEditProfile(): void {
    this.router.navigate([`/user/editprofile/${this.userId}`], {
      state: {
        profile: {
          id: this.userId,
          name: this.name,
          email: this.email,
          contactNumber: this.contact,
          community: this.community,
          address: this.address,
          role: this.role
        }
      }
    });
  }

  navigateToNotification(): void {
    this.router.navigate([`/user/notification/${this.userId}`]);
  }

  navigateToHistory(): void {
    this.router.navigate([`/pickup/${this.userId}`]);
  }
}
