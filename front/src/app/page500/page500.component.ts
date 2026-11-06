import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-page500',
  standalone: true,
  imports: [MatIcon, RouterLink, MatButton],
  templateUrl: './page500.component.html',
  styleUrl: './page500.component.css'
})
export class Page500Component {

}
