import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-editprofile',
  templateUrl: './editprofile.component.html',
  styleUrls: ['./editprofile.component.css']
})
export class editprofileComponent implements OnInit {
  name: string = '';
  email: string = '';
  contactNumber: string = '';
  community: string = '';
  address: string = '';
  role: string = '';
  userId: string = '';

  roleOptions: string[] = ['Admin', 'Member'];
  communityOptions: { name: string; _id: string }[] = [];
  selectedCommunity: { name: string; _id: string } | undefined;

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
    }
    this.fetchCommunityOptions();
  }

  fetchCommunityOptions(): void {
    this.http.get<any[]>('http://localhost:3000/api/communities').subscribe({
      next: (communities) => {
        this.communityOptions = communities.map(community => ({
          _id: community._id,
          name: community.name,
        }));
      },
      error: (err) => console.error('Error fetching community options:', err)
    });
  }

  fetchUserProfile(userId: string): void {
    this.http.get<any>(`http://localhost:3000/api/user/${userId}`).subscribe({
      next: (profile) => {
        this.name = profile.username;
        this.email = profile.email;
        this.contactNumber = profile.contact;
        this.community = profile.community;
        this.address = profile.address;
        this.role = profile.role;

        this.selectedCommunity = this.communityOptions.find(
          (community) => community.name === this.community
        );
      },
      error: (err) => console.error('Error fetching user profile:', err)
    });
  }

  updateProfile(): void {
    const updatedInfo = {
      username: this.name,
      email: this.email,
      contact: this.contactNumber,
      community: this.community,  // Send the community name directly as a string
      address: this.address,
      role: this.role
    };
  
    console.log('Updating Profile with community:', updatedInfo.community);
  
    this.http.put(`http://localhost:3000/api/user/${this.userId}`, updatedInfo).subscribe({
      next: () => {
        alert('Profile updated successfully!');
        this.router.navigate([`/user/${this.userId}`], { state: { profile: updatedInfo } });
      },
      error: (err) => console.error('Error updating profile:', err)
    });
  }    
  
  onCommunityChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedCommunity = this.communityOptions.find(
      (community) => community._id === selectedValue
    );
  
    // Assign the name of the selected community
    if (this.selectedCommunity) {
      this.community = this.selectedCommunity.name;  // Use the name here
      console.log('Community selected:', this.community);  // It should show the correct name
    }
  }  

  onRoleChange(event: Event): void {
    this.role = (event.target as HTMLSelectElement).value;
  }
}
