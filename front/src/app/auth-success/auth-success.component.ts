import { Component, OnInit } from '@angular/core';
import { LoginService } from '../login/login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-success',
  standalone: true,
  imports: [],
  templateUrl: './auth-success.component.html',
  styleUrl: './auth-success.component.css'
})
export class AuthSuccessComponent implements OnInit{

  constructor( private loginService: LoginService, private router: Router) {}

  ngOnInit() {
    this.loginService.getUser().subscribe({
      next: (user) => {
        console.log("Utilisateur connecté :", user);
        this.router.navigate(['/channel']);
      },
      error: () => {
        console.log("Token invalide");
        this.router.navigate(['/login']);
      }
    });
  }

}
