import { Component, Input, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentResponse } from '../Model/studtent-response';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './students.html',
  styleUrls: ['./students.css']
})
export class StudentsComponent {
  @Input() students!: WritableSignal<StudentResponse[]>;

  getIcon(icon: string): string {
    return '';
  }

  getStatusClasses(status: string, type: 'student' | 'batch'): string {
    const lowerStatus = status.toLowerCase();

    // Student Status
    if (type === 'student') {
      if (lowerStatus.includes('present')) return 'badge bg-success';
      if (lowerStatus.includes('late')) return 'badge bg-warning text-dark';
      if (lowerStatus.includes('absent')) return 'badge bg-danger';
      if (lowerStatus.includes('excused')) return 'badge bg-info text-dark';
    }

    return 'badge bg-light text-dark';
  }
}
