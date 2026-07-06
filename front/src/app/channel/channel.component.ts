import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChannelServiceService, Message } from './channel-service.service';
import { NgFor, DatePipe, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [NgFor, DatePipe, NgIf, FormsModule],
  templateUrl: './channel.component.html',
  styleUrl: './channel.component.css'
})
export class ChannelComponent implements OnInit {

  messages: Message[] = [];
  channelId!: string;
  // private socket!: WebSocket;
  isLoaded = false;
  showModal: boolean = false;
  // On définit la variable messageShowModal en disant que c'est une chaine de caractère
  messageShowModal = '';

  constructor(
    private channelService: ChannelServiceService,
    private route: ActivatedRoute
  ) {}

  loadMessage() {
    this.channelService.getMessage(this.channelId).subscribe(data => {
      this.messages = data;
      this.isLoaded = true;
      console.log("Messages chargés :", this.messages.length);
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get("id");

      if(!id) return;

      this.channelId = id;

      //1) On charge ce qu'il y a déjà en db
      this.loadMessage();

      //2) On déclenche le sync historique UNE fois
      this.channelService.syncChannel(this.channelId).subscribe();

      //3) WebSocket temps réel
      const socket = new WebSocket(
        `ws://localhost:8000/ws/channel/${this.channelId}/`
      );
      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        this.messages.push(message);
      };
    });
    
    
  }

  messageText : string = '';
  validate_input(): boolean {
    this.showModal = false;
    //On vérifie si l'input est vide ou pas 
    if(!this.messageText || this.messageText.trim() === '') {
      this.showModal = true;
      this.messageShowModal = "Le message ne contient aucun caractères.";
      return false;
    }
    
    //On fait une boucle for pour vérifier tous les caractères dans le messages
    for (let i = 0; i < this.messageText.length; i++) {
      const code = this.messageText.charCodeAt(i);

      const isUpper = code >= 65 && code <= 90;
      const isLower = code >= 97 && code <= 122;
      const isNumber = code >= 48 && code <= 57;
      const isSpace = code === 32;
      const isVirgule = code === 44;
      const isPoint = code === 46;
      const isApo = code === 39;

      if(!(isUpper || isLower || isNumber || isSpace || isVirgule || isPoint || isApo)) {
        this.showModal = true;
        this.messageShowModal = "Le message contient des caractères non autorisé.";
        return false;
      }
    }

    return true;

  }

  sendMessageDiscord(): void {
    const isValid = this.validate_input();
    

    if(!isValid){
      this.showModal = true;
      return;
    };
    
    // const idChannel = this.channelId;
    const message = this.messageText;
    this.channelService.sendMessage(message).subscribe({
      next: () => {
        //On définit le message à afficher dans le showModal
        this.messageShowModal = "Message envoyer avec succès.";
        this.showModal = true;
        this.messageText = "";
        
        
      },
      error: () => {
        this.messageShowModal = "Erreur lors de l'envoi du message.";
      }
    });
  }
  
}
