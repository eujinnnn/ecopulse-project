import { Component, OnInit } from '@angular/core';

export interface Location {
    name: string;
    opacity: number;
    x?: number;
    y?: number;
    animationDelay?: string;
}

@Component({
    selector: 'app-areas',
    templateUrl: './areas.component.html',
    styleUrls: ['./areas.component.css']
})

export class AreasComponent implements OnInit {
    locations: Location[] = [
        { name: 'Kuala Lumpur', opacity: 0.8 },
        { name: 'Petaling Jaya', opacity: 0.7 },
        { name: 'Subang Jaya', opacity: 0.6 },
        { name: 'Shah Alam', opacity: 0.5 },
        { name: 'Cyberjaya', opacity: 0.4 },
        { name: 'Putrajaya', opacity: 0.3 },
        { name: 'Ampang', opacity: 0.6 },
        { name: 'Cheras', opacity: 0.5 },
        { name: 'KL Sentral', opacity: 0.4 },
        { name: 'Gombak', opacity: 0.3 },
        { name: 'Titiwangsa', opacity: 0.7 },
        { name: 'Puchong', opacity: 0.5 },
        { name: 'Batu Caves', opacity: 0.6 },
        { name: 'Klang', opacity: 0.4 },
        { name: 'Kajang', opacity: 0.3 },
        { name: 'Serdang', opacity: 0.2 },
        { name: 'Kota Damansara', opacity: 0.5 },
        { name: 'Sungai Buloh', opacity: 0.6 },
        { name: 'Bandar Sunway', opacity: 0.4 },
    ];

    constructor() {}

    ngOnInit(): void {
        this.locations.forEach((location, index) => {
            location.x = 70 + Math.random() * 20;
            location.y = 10 + Math.random() * 80;
            location.animationDelay = `${index * 100}ms`;
        });
    }
}
