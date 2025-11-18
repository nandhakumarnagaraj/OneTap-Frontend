import { Component, signal, OnInit, computed, WritableSignal, inject } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectionStrategy } from '@angular/core';
import { forkJoin } from 'rxjs';
import './app.css';
import { SamsDataService } from './Services/sams-data-service';
import { BatchResponse } from './Model/batch-response';
import { StudentResponse } from './Model/studtent-response';
import { StudentCreateRequest } from './Model/student-create-request';
import { BatchCreateRequest } from './Model/batch-create-request';

import { HeaderComponent } from './header/header';
import { NavigationComponent } from './navigation/navigation';
import { AttendanceComponent } from './attendance/attendance';
import { BatchesComponent } from './batches/batches';
import { StudentsComponent } from './students/students';
import { CreateStudentComponent } from './create-student/create-student';
import { DashboardMetricsComponent } from './dashboard-metrics/dashboard-metrics';

type View = 'dashboard' | 'attendance' | 'students' | 'batches' | 'create-student';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    HeaderComponent,
    NavigationComponent,
    AttendanceComponent,
    BatchesComponent,
    StudentsComponent,
    CreateStudentComponent,
    DashboardMetricsComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  private samsDataService: SamsDataService = inject(SamsDataService);

  // State
  currentView: WritableSignal<View> = signal('dashboard');
  isLoading: WritableSignal<boolean> = signal(false);
  isProcessing: WritableSignal<boolean> = signal(false);
  actionType: WritableSignal<'in' | 'out' | null> = signal(null);

  batches: WritableSignal<BatchResponse[]> = signal([]);
  students: WritableSignal<StudentResponse[]> = signal([]);

  errorMessage: WritableSignal<string | null> = signal(null);
  successMessage: WritableSignal<string | null> = signal(null);

  isCreatingBatch = signal(false);

  // Navigation Items
  views = [
    { view: 'dashboard' as View, label: 'Dashboard' },
    { view: 'attendance' as View, label: 'Attendance' },
    { view: 'students' as View, label: 'Students' },
    { view: 'batches' as View, label: 'Batches' },
    { view: 'create-student' as View, label: 'Create Student' },
  ];

  constructor() {}

  ngOnInit() {
    this.fetchData();
  }

  // --- Computed Signals for Dashboard ---

  activeBatchesCount = computed(() =>
    this.batches().filter((b) => b.status === 'ACTIVE').length
  );

  checkedInCount = computed(() =>
    this.students().filter((s) => s.checkedIn).length
  );

  presentTodayCount = computed(() =>
    this.students().filter(s => s.status === 'PRESENT' || s.status === 'LATE').length
  );

  attendanceRatio = computed(() => {
    const total = this.students().length;
    const present = this.presentTodayCount();
    return total > 0 ? (present / total) * 100 : 0;
  });

  // --- Utility Methods ---

  setView(view: View): void {
    this.currentView.set(view);
    this.clearMessages();
  }

  clearMessages(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  toggleCreateBatchForm(): void {
    this.isCreatingBatch.set(!this.isCreatingBatch());
  }

  // --- Data Fetching (Delegated to Service) ---

  fetchData(): void {
    this.isLoading.set(true);
    this.clearMessages();

    const dataObservables = forkJoin({
      batches: this.samsDataService.getAllBatches(),
      students: this.samsDataService.getAllStudents(),
    });

    dataObservables.subscribe({
      next: (results) => {
        const batchResult = results.batches;
        const studentResult = results.students;

        const errorMsg = batchResult.errorMessage || studentResult.errorMessage;
        if (errorMsg) {
          this.errorMessage.set(errorMsg);
        }

        this.batches.set(batchResult.data);
        this.students.set(studentResult.data);
      },
      error: (e) => {
        console.error('Initial data fetch failed with error:', e);
        this.errorMessage.set(e.message || 'An unexpected error occurred during data load.');
        this.batches.set([]);
        this.students.set([]);
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
  }

  private findStudentByRollNumber(rollNumber: string): StudentResponse | undefined {
    return this.students().find(s => s.rollNumber.toLowerCase() === rollNumber.toLowerCase());
  }

  // --- Event Handlers ---

  handleCheckIn(rollNumber: string): void {
    this.actionType.set('in');
    this.isProcessing.set(true);
    this.clearMessages();

    const student = this.findStudentByRollNumber(rollNumber);

    if (!student) {
      this.errorMessage.set(`Student with Roll Number '${rollNumber}' not found.`);
      this.isProcessing.set(false);
      return;
    }

    this.samsDataService.checkIn(student.sid).subscribe({
      next: (updatedStudent) => {
        this.successMessage.set(
          `${updatedStudent.sname} (Roll: ${updatedStudent.rollNumber}) checked IN successfully! Status: ${updatedStudent.status}`
        );
        this.fetchData();
      },
      error: (error) => {
        this.errorMessage.set(error.message || 'Check-in failed due to network error.');
      },
      complete: () => {
        this.isProcessing.set(false);
      },
    });
  }

  handleCheckOut(rollNumber: string): void {
    this.actionType.set('out');
    this.isProcessing.set(true);
    this.clearMessages();

    const student = this.findStudentByRollNumber(rollNumber);

    if (!student) {
      this.errorMessage.set(`Student with Roll Number '${rollNumber}' not found.`);
      this.isProcessing.set(false);
      return;
    }

    this.samsDataService.checkOut(student.sid).subscribe({
      next: (updatedStudent) => {
        this.successMessage.set(
          `${updatedStudent.sname} (Roll: ${updatedStudent.rollNumber}) checked OUT successfully! Hours: ${updatedStudent.hoursPresent.toFixed(2)}h`
        );
        this.fetchData();
      },
      error: (error) => {
        this.errorMessage.set(error.message || 'Check-out failed due to network error.');
      },
      complete: () => {
        this.isProcessing.set(false);
      },
    });
  }

  handleCreateStudent(student: StudentCreateRequest): void {
    this.isProcessing.set(true);
    this.clearMessages();

    this.samsDataService.createStudent(student).subscribe({
      next: (createdStudent) => {
        this.successMessage.set(
          `Student ${createdStudent.sname} (Roll: ${createdStudent.rollNumber}) created successfully!`
        );
        this.fetchData(); // Refresh student list
        this.setView('students'); // Switch to students view
      },
      error: (error) => {
        this.errorMessage.set(error.message || 'Student creation failed due to a network error.');
      },
      complete: () => {
        this.isProcessing.set(false);
      },
    });
  }

  handleCreateBatch(batch: BatchCreateRequest): void {
    this.isProcessing.set(true);
    this.clearMessages();

    this.samsDataService.createBatch(batch).subscribe({
      next: (createdBatch) => {
        this.successMessage.set(
          `Batch ${createdBatch.batchName} (Code: ${createdBatch.batchCode}) created successfully!`
        );
        this.fetchData(); // Refresh batch list
        this.isCreatingBatch.set(false); // Hide form
      },
      error: (error) => {
        this.errorMessage.set(error.message || 'Batch creation failed due to a network error.');
      },
      complete: () => {
        this.isProcessing.set(false);
      },
    });
  }
}
