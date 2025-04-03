import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent {
  isSignUpVisible: boolean = false;

  loginUsername: string = '';
  loginPassword: string = '';
  signupEmail: string = '';
  signupUsername: string = '';
  signupPassword: string = '';
  signupCommunity: string = '';

  constructor(private router: Router, private authService: AuthService) {}

  toggleSign() {
    this.isSignUpVisible = false;
  }

  toggleLog() {
    this.isSignUpVisible = true;
  }

  login() {
    if (this.loginUsername && this.loginPassword) {
      this.authService.login(this.loginUsername, this.loginPassword)
        .pipe(
          catchError(error => {
            alert('Login failed: ' + error.error.message);
            return throwError(error);
          })
        )
        .subscribe(response => {
          if (response.message === 'Login successful') {
            localStorage.setItem('token', response.token);
            localStorage.setItem('userId', response.userId);
            localStorage.setItem('role', response.role);
            localStorage.setItem('community', response.community);

            this.router.navigate([`/user/${response.userId}`]);
          }
        });
    } else {
      alert('Please fill in all fields');
    }
  }

  signup() {
    if (this.signupEmail && this.signupUsername && this.signupPassword) {
      this.authService.signup(this.signupEmail, this.signupUsername, this.signupPassword, this.signupCommunity)
        .pipe(
          catchError(error => {
            alert('Signup failed: ' + error.error.message);
            return throwError(error);
          })
        )
        .subscribe(response => {
          if (response.message === 'Signup successful') {
            localStorage.setItem('token', response.token);
            localStorage.setItem('userId', response.userId);
            localStorage.setItem('role', response.role);
            this.router.navigate([`/user/editprofile/${response.userId}`]);
          }
        });
    } else {
      alert('Please fill in all fields');
    }
  }          
}
