import { Component, signal, OnInit, computed, WritableSignal, inject } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectionStrategy } from '@angular/core';
import { forkJoin } from 'rxjs';
import './app.component.css';
import { SamsDataService } from './Services/sams-data-service';
import { BatchResponse } from './Model/batch-response';
import { StudentResponse } from './Model/studtent-response';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, SamsDataService, DashboardMetricsComponent, SafeHtmlPipe],
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

  // Form input for attendance
  rollNumberInput: string = '';

  // Navigation Items
  views = [
    { view: 'dashboard' as View, label: 'Dashboard' },
    { view: 'attendance' as View, label: 'Attendance' },
    { view: 'students' as View, label: 'Students' },
    { view: 'batches' as View, label: 'Batches' },
  ];

  constructor() {}

  ngOnInit() {
    this.fetchData();
  }

  // --- Icon Helper ---
  getIcon(view: View): string {
    switch (view) {
      case 'dashboard':
        return ICON_DASHBOARD;
      case 'attendance':
        return ICON_ATTENDANCE;
      case 'students':
        return ICON_STUDENTS;
      case 'batches':
        return ICON_BATCHES;
      default:
        return '';
    }
  }

  // --- Computed Signals for Dashboard ---

  activeBatchesCount = computed(() =>
    this.batches().filter((b) => b.status === 'ACTIVE').length
  );

  totalAvailableSlots = computed(() =>
    this.batches().reduce((sum, b) => sum + b.availableSlots, 0)
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

  getTabClasses(view: View): string {
    return this.currentView() === view
      ? 'tab-button tab-active'
      : 'tab-button tab-inactive';
  }

  getStatusClasses(status: string, type: 'student' | 'batch'): string {
    const lowerStatus = status.toLowerCase();

    // Student Status
    if (type === 'student') {
      if (lowerStatus.includes('present')) return 'status-present';
      if (lowerStatus.includes('late')) return 'status-late';
      if (lowerStatus.includes('absent')) return 'status-absent';
      if (lowerStatus.includes('excused')) return 'status-excused';
    }

    // Batch Status
    if (type === 'batch') {
      if (lowerStatus.includes('active')) return 'status-active';
      if (lowerStatus.includes('completed') || lowerStatus.includes('inactive')) return 'status-completed';
      if (lowerStatus.includes('upcoming')) return 'status-upcoming';
    }

    return 'status-inactive';
  }

  clearMessages(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  // --- Data Fetching (Delegated to Service) ---

  /**
   * Fetches all students and batches in parallel using forkJoin and updates signals.
   */
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

  // --- Attendance Handlers (Delegated to Service) ---

  /**
   * Handles student check-in using the service and Observable subscription.
   */
  handleCheckIn(): void {
    this.actionType.set('in');
    this.isProcessing.set(true);
    this.clearMessages();

    const student = this.findStudentByRollNumber(this.rollNumberInput);

    if (!student) {
      this.errorMessage.set(`Student with Roll Number '${this.rollNumberInput}' not found.`);
      this.isProcessing.set(false);
      return;
    }

    this.samsDataService.checkIn(student.sid).subscribe({
      next: (updatedStudent) => {
        this.successMessage.set(
          `${updatedStudent.sname} (Roll: ${updatedStudent.rollNumber}) checked IN successfully! Status: ${updatedStudent.status}`
        );
        this.fetchData();
        this.rollNumberInput = '';
      },
      error: (error) => {
        this.errorMessage.set(error.message || 'Check-in failed due to network error.');
      },
      complete: () => {
        this.isProcessing.set(false);
      },
    });
  }

  /**
   * Handles student check-out using the service and Observable subscription.
   */
  handleCheckOut(): void {
    this.actionType.set('out');
    this.isProcessing.set(true);
    this.clearMessages();

    const student = this.findStudentByRollNumber(this.rollNumberInput);

    if (!student) {
      this.errorMessage.set(`Student with Roll Number '${this.rollNumberInput}' not found.`);
      this.isProcessing.set(false);
      return;
    }

    this.samsDataService.checkOut(student.sid).subscribe({
      next: (updatedStudent) => {
        this.successMessage.set(
          `${updatedStudent.sname} (Roll: ${updatedStudent.rollNumber}) checked OUT successfully! Hours: ${updatedStudent.hoursPresent.toFixed(2)}h`
        );
        this.fetchData();
        this.rollNumberInput = '';
      },
      error: (error) => {
        this.errorMessage.set(error.message || 'Check-out failed due to network error.');
      },
      complete: () => {
        this.isProcessing.set(false);
      },
    });
  }
}