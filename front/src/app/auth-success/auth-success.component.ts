import { Component, OnInit } from '@angular/core';
import { LoginService } from '../login/login.service';
import { Router } from '@angular/router';
import { AuthSuccessService } from './auth-success.service';


@Component({
  selector: 'app-auth-success',
  standalone: true,
  imports: [],
  templateUrl: './auth-success.component.html',
  styleUrl: './auth-success.component.css'
})
export class AuthSuccessComponent implements OnInit{

  constructor( private loginService: LoginService, private router: Router, private authSuccessService: AuthSuccessService) {}

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
    this.authSuccessService.getCsrf().subscribe({
      next: (res) => {
        console.log(res);
      },
      error: (err) => {
        console.error("Erreur lors de la récupération du csrf.");
      }
    })
  }

}
