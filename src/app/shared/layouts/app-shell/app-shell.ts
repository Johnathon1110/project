import { Component } from '@angular/core';
import { Sidebar } from '../sidebar/sidebar';
import { Topbar } from '../topbar/topbar';

@Component({
  selector: 'app-app-shell',
  standalone: true,
  imports: [Sidebar, Topbar],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.css'
})
export class AppShell {}
