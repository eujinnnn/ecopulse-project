import { Component } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../service/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent {
  selectedIssue = '';
  issueLocation = '';
  issueDescription = '';
  additionalComments = '';
  uploadedImage: File | null = null;
  userId: string = '';

  issueOptions: string[] = ['missed pickup', 'overflowing bin', 'illegal dumping'];

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
    }
  }

  onLocationChange(event: Event): void {
    this.issueLocation = (event.target as HTMLInputElement).value;
  }

  onDescriptionChange(event: Event): void {
    this.issueDescription = (event.target as HTMLInputElement).value;
  }

  onCommentsChange(event: Event): void {
    this.additionalComments = (event.target as HTMLInputElement).value;
  }

  onIssueChange(event: Event): void {
    this.selectedIssue = (event.target as HTMLSelectElement).value;
  }

  onImageUpload(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files?.length) {
      this.uploadedImage = fileInput.files[0];
    }
  }

  clearForm(): void {
    this.selectedIssue = '';
    this.issueLocation = '';
    this.issueDescription = '';
    this.additionalComments = '';
    this.uploadedImage = null;

    const issuePicker = document.querySelector('.issuepicker') as HTMLSelectElement;
    if (issuePicker) issuePicker.selectedIndex = 0;
  }

  onSubmit(): void {
    if (!this.selectedIssue || !this.issueLocation || !this.issueDescription) {
      alert('Please fill in all required fields: issue type, location, and description.');
      return;
    }

    const formData = new FormData();
    formData.append('userId', this.userId);
    formData.append('selectedIssue', this.selectedIssue);
    formData.append('issueLocation', this.issueLocation);
    formData.append('issueDescription', this.issueDescription);
    if (this.additionalComments) {
      formData.append('additionalComments', this.additionalComments);
    }
    if (this.uploadedImage) {
      formData.append('image', this.uploadedImage);
    }

    // Send request to the backend with the userId in the URL
    this.http.post(`http://localhost:3000/api/report/${this.userId}`, formData).subscribe({
      next: () => {
        alert(`Your report is submitted successfully!\n\n` +
              `Selected Issue: ${this.selectedIssue}\n` +
              `Issue Location: ${this.issueLocation}\n` +
              `Issue Description: ${this.issueDescription}\n` +
              `Additional Description: ${this.additionalComments}\n` +
              `Image: ${this.uploadedImage}`);
        this.clearForm();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error submitting report:', error.message);
        alert('Failed to submit the report. Please try again later.');
      }
    });
  }
}
