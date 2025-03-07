import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  activeTab: string = 'home';

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    console.log('Active tab set to:', tab);
  }
}
