import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { LoginService } from './login.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  constructor(private loginService: LoginService) {}
  

  //On envoie la requête pour se connecter avec discord
  sendRequest() {
     this.loginService.loginWithDiscord();
  }

}
