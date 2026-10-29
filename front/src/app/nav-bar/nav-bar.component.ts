import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { NavBarService, Channel } from './nav-bar.service';
import { NgFor, NgIf } from '@angular/common';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { LoginComponent } from '../login/login.component';
import { MatMenuModule} from '@angular/material/menu'
import { MatSnackBar } from '@angular/material/snack-bar';


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
  private matSnackBar = inject(MatSnackBar);

  botInVocal = this.navBarService.botInchannels;

  isLogged = this.navBarService.isLogged;


  ngOnInit(): void {
    this.navBarService.getBotVoiceStatus().subscribe({
      next: (res) => {
        this.navBarService.botInchannels.set(res.connected);

        console.log("Ania est connectée :", this.navBarService.botInchannels());

      },
      error : (err) => {
        console.error("Impossible de récupérer l'état vocal d'Ania", err);
      }
    });
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

  sendRequestJoinBotVocal() {
     this.navBarService.joinBotVocal().subscribe({
      next: (res) => {
        this.navBarService.botInchannels.set(true);
        this.matSnackBar.open(res.success, 
          "Fermer",
          {
            duration: 3000
          }
        );
      },
      error: (err) => {
        this.matSnackBar.open(err.error.error,
          "Fermer",
          {
            duration: 3000
          }
        );
      }
     });
  }

  sendRequestDisconnectBotVoice(){
    this.navBarService.disconnectBotVoice().subscribe({
      next: (res) => {
        if(res.status === 200) {
          this.navBarService.botInchannels.set(false);
        }
        
        this.matSnackBar.open(
          res.body?.detail ?? "Ania a été déconnectée",
          "Fermer",
          {
            duration: 3000
          }
        );
      },
      error: (err) => {
        this.matSnackBar.open(
          err.error?.detail ?? err.error?.error ?? "Erreur de déconnexion",
          "Fermer", 
          {
            duration: 3000
          }
        );
      } 
    });
  }
}
