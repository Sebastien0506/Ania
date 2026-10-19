import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { NavBarService, Channel } from './nav-bar.service';
import { NgFor, NgIf } from '@angular/common';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { LoginComponent } from '../login/login.component';
import { MatMenuModule} from '@angular/material/menu'


@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [
    RouterLink,
    NgFor,
    NgIf,
    MatButtonModule,
    MatDialogModule,
    MatMenuModule
],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css'
})
export class NavBarComponent {

  private navBarService = inject(NavBarService); 
  channels: Channel[] = [];

  constructor(
    private dialogRef: MatDialog
  ) {}

  isLogged = this.navBarService.isLogged;


  ngOnInit(): void {
    this.navBarService.getChannel().subscribe({
      next: (data) => {
        this.channels = data;
        this.navBarService.isLogged.set(true);
        console.log("Channels:", this.channels);
      },
      error: () => {
        this.navBarService.isLogged.set(false);
      }
    });
  }

  openDialog() {
    this.dialogRef.open(LoginComponent, {
      width: '700px',
      height: '700px'
    });
  }
}
