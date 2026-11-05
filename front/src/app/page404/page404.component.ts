import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page404',
  standalone: true,
  imports: [MatIcon, MatButton, RouterLink],
  templateUrl: './page404.component.html',
  styleUrl: './page404.component.css'
})
export class Page404Component {

}
