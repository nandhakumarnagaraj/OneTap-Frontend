import { Component, EventEmitter, Input, Output, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance.html',
  styleUrls: ['./attendance.css']
})
export class AttendanceComponent {
  @Input() isProcessing!: WritableSignal<boolean>;
  @Input() actionType!: WritableSignal<'in' | 'out' | null>;
  @Output() checkIn = new EventEmitter<string>();
  @Output() checkOut = new EventEmitter<string>();

  rollNumberInput: string = '';

  handleCheckIn(): void {
    this.checkIn.emit(this.rollNumberInput);
  }

  handleCheckOut(): void {
    this.checkOut.emit(this.rollNumberInput);
  }
}
