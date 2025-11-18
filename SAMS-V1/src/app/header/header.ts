import { Component, Input, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent {
  @Input() errorMessage!: WritableSignal<string | null>;
  @Input() successMessage!: WritableSignal<string | null>;
}
