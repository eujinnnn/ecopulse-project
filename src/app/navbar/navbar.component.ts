import { Component } from '@angular/core';

@Component ({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css']
})

export class NavbarComponent {
    isDropdownVisible: boolean = false;

    showDropdown() {
        this.isDropdownVisible = true;
    }

    hideDropdown() {
        this.isDropdownVisible = false;
    }
}