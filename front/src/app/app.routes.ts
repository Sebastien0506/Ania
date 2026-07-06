import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthSuccessComponent } from './auth-success/auth-success.component';
import { ChannelComponent } from './channel/channel.component';


export const routes: Routes = [
    {path: 'login', component: LoginComponent},
    {path: 'auth/success', component: AuthSuccessComponent},
    {path: 'channel',  component: ChannelComponent},
    {path: 'channel/:id', component: ChannelComponent}
];
