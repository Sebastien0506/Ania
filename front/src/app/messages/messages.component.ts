import { Component, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Messages, MessagesService } from './messages.service';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon, MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [MatInputModule, FormsModule, MatFormFieldModule, MatButtonModule, MatIconModule],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css'
})
export class MessagesComponent {

  constructor(private activedRoute: ActivatedRoute, private messageService: MessagesService){}

  allMessage : Messages[] = [];

  ngOnInit(): void {
    //Au chargement de la page on récupère l'id
    this.activedRoute.paramMap.subscribe(params => {
      const id = params.get("id");

      //On fait la requête pour récupérer les messages du salon textuel
      this.messageService.getMessage(id).subscribe({
        next: (messages) => {
            this.allMessage = messages;
            console.log(this.allMessage);
        },
        error: (err) => {
          console.error(err);
        }
      })
    })
  }

}
