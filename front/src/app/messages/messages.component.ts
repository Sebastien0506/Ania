import { Component, signal, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Messages, MessagesService } from './messages.service';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon, MatIconModule} from '@angular/material/icon';
import { MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [MatInputModule, FormsModule, MatFormFieldModule, MatButtonModule, MatIconModule, ReactiveFormsModule],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css'
})
export class MessagesComponent {

  constructor(private activedRoute: ActivatedRoute, private messageService: MessagesService){}

  private snackBar = inject(MatSnackBar);
  allMessage : Messages[] = [];

  messageInput = new FormControl('');

  //On fait la variable pour stocker les messages d'erreur
  errorMessage = signal("");
  
  //On stock l'id du channel
  channelId: string | null = null;

  socket: WebSocket | null = null;

  ngOnInit(): void {
    //Au chargement de la page on récupère l'id
    this.activedRoute.paramMap.subscribe(params => {
      const id = params.get("id");

      if(!id){
        return;
      }
      this.channelId = id;

      //On fait la requête pour récupérer les messages du salon textuel
      this.loadMessages(id);

      //On écoute les nouveaux messages
      this.connectWebsocket(id);
    })
  }

  loadMessages(channelId: string) : void {
    this.messageService.getMessage(channelId).subscribe({
    next: (messages) => {
      this.allMessage = messages;
      console.log("Message récupérés : ", this.allMessage);
    },
    error :  (err) => {
      console.error(err);
    }
    });
  }

  connectWebsocket(channelId: string) : void {
    //On ferme l'ancienne connexion si on change de salon
    this.socket?.close();

    const protocol = window.location.protocol === "https:" ? "wss:": "ws:";

    const url = `${protocol}//${window.location.host}/ws/channel/${channelId}/`;

    console.log("Url WebSocket : ", url);

    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log("WebSocket connecté au salon : ", channelId);
    };
    this.socket.onmessage = (event) => {
        console.log("Nouveau message Discord : ", JSON.parse(event.data));

        //On recharge les message du salon
        this.loadMessages(channelId);
    };

    this.socket.onclose = (event) => {
      console.log("WebSocket déconnecté.");
      console.log("Code :", event.code);
      console.log("Raison :", event.reason);
      console.log("Fermeture normale :", event.wasClean);
    }
    this.socket.onerror = (error) => {
      console.error("Erreur WebSocket : ", error);
    };
  }

  checkInput(): boolean {
    const messageInput = this.messageInput.value?.trim();
    console.log("Message", messageInput);
    // Vérifie si le message est vide
    if (!messageInput) {
        this.errorMessage.set("Le texte est vide");
        this.snackBar.open(this.errorMessage(), "Fermer", {
            duration: 3000
        });
        return false;
    }

    // Normalise le texte
    const normalizeMessageInput = messageInput.normalize("NFC");

    // Détecte les liens
    const regexLink = /(?:https?:\/\/|www\.)\S+|\b[\p{L}\p{N}-]+(?:\.[\p{L}\p{N}-]+)+\b/iu;
    const regexForbidden = /[<>]/

    if (regexLink.test(normalizeMessageInput) || regexForbidden.test(normalizeMessageInput)) {
        this.errorMessage.set("Le message contient des liens ou des caractères interdits.");
        this.snackBar.open(this.errorMessage(), "Fermer", {
            duration: 3000
        });
        return false;
    }

    return true;
}

  sendRequest(){

    //On vérifie que le texte est valide
    const checkInput = this.checkInput();

    if(!checkInput){
      return;
    }
    console.log("Résultat de checkInput: ", checkInput);

    //On crée la variable data
    const data  = {
      "message": this.messageInput.value,
      "channel_id": this.channelId
    }
    console.log("Donnée dans data: ", data);
    //On envoi la requête
    this.messageService.sendMessage(data).subscribe({
      next: (res) => {
        console.log(res);
      },
      error: (err) => {
        console.error("Erreur lors de l'envoi du message.");
      }
    });
  }

}
