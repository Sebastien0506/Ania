import { Component } from '@angular/core';

import { RouterLink } from '@angular/router';
import { NavBarService, Channel } from './nav-bar.service';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [
    RouterLink,
    NgFor,
    NgIf
],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css'
})
export class NavBarComponent {
  
  // On initialise channel a un tableau vide et isLogged a false
  channels: Channel[] = [];
  isLogged = true;
  
  constructor(private navBarService: NavBarService) {}
  
  // Au chargement de la page on fait la requête
  ngOnInit(): void {
    this.navBarService.getChannel().subscribe({
      next: (data) => {
        this.channels = data;
        this.isLogged;
        console.log("Channels récupéres:", data);
        console.log("Channels:", this.channels);
      },
      error: (err) => {
        console.log("Utilisateur non connecté");
        this.isLogged = false;
      }
    });
  }
  

}
