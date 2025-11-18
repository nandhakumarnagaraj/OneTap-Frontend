import { Component, EventEmitter, Input, Output, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BatchResponse } from '../Model/batch-response';
import { BatchCreateRequest } from '../Model/batch-create-request';

@Component({
  selector: 'app-batches',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './batches.html',
  styleUrls: ['./batches.css']
})
export class BatchesComponent {
  @Input() batches!: WritableSignal<BatchResponse[]>;
  @Input() isCreatingBatch!: WritableSignal<boolean>;
  @Input() isProcessing!: WritableSignal<boolean>;
  @Output() createBatch = new EventEmitter<BatchCreateRequest>();
  @Output() toggleCreateBatch = new EventEmitter<void>();

  newBatch: BatchCreateRequest = { batchName: '', batchCode: '', maxCount: 0, description: null, startDate: null, endDate: null, trainingStartDate: '', trainingEndDate: '', batchCapacity: 0 };

  handleCreateBatch(): void {
    this.createBatch.emit(this.newBatch);
  }

  toggleCreateBatchForm(): void {
    this.toggleCreateBatch.emit();
  }

  getIcon(icon: string): string {
    return '';
  }

  getStatusClasses(status: string, type: 'student' | 'batch'): string {
    const lowerStatus = status.toLowerCase();

    // Batch Status
    if (type === 'batch') {
      if (lowerStatus.includes('active')) return 'badge bg-primary';
      if (lowerStatus.includes('completed') || lowerStatus.includes('inactive')) return 'badge bg-secondary';
      if (lowerStatus.includes('upcoming')) return 'badge bg-info text-dark';
    }

    return 'badge bg-light text-dark';
  }
}
