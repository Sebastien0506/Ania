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
  

  sendRequest() {
     this.loginService.loginWithDiscord();
  }

}
