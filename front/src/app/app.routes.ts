import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthSuccessComponent } from './auth-success/auth-success.component';
import { ChannelComponent } from './channel/channel.component';
import { MessagesComponent } from './messages/messages.component';
import { HomeComponent } from './home/home.component';
import { Page403Component } from './page403/page403.component';
import { Page404Component } from './page404/page404.component';
import { Page500Component } from './page500/page500.component';
import { Page401Component } from './page401/page401.component';


export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'login', component: LoginComponent},
    {path: 'auth/success', component: AuthSuccessComponent},
    {path: 'channel',  component: ChannelComponent},
    {path: 'channel/:id', component: ChannelComponent},
    {path: 'messages/:id', component: MessagesComponent},
    {path: 'page404', component: Page404Component},
    {path: 'page403', component: Page403Component},
    {path: 'page500', component: Page500Component},
    {path: 'page401', component: Page401Component},
    {path: '**', component: Page404Component}
];
