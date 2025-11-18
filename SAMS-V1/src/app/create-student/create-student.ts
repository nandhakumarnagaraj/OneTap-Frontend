import { Component, EventEmitter, Input, Output, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentCreateRequest } from '../Model/student-create-request';
import { BatchResponse } from '../Model/batch-response';

@Component({
  selector: 'app-create-student',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-student.html',
  styleUrls: ['./create-student.css']
})
export class CreateStudentComponent {
  @Input() isProcessing!: WritableSignal<boolean>;
  @Input() batches!: WritableSignal<BatchResponse[]>;
  @Output() createStudent = new EventEmitter<StudentCreateRequest>();

  newStudent: StudentCreateRequest = { sname: '', email: null, phone: null, rollNumber: '', batchId: null };

  handleCreateStudent(): void {
    this.createStudent.emit(this.newStudent);
  }
}
