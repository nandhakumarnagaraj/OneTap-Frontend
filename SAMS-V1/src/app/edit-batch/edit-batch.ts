import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BatchResponse } from '../Model/batch-response';
import { BatchCreateRequest } from '../Model/batch-create-request';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SamsDataService } from '../Services/sams-data';

@Component({
  selector: 'app-edit-batch',
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-batch.html',
  styleUrl: './edit-batch.css'
})
export class EditBatchComponent implements OnInit {
  batchId!: number;
  batch: BatchResponse = {} as BatchResponse;
  updatedBatch: BatchCreateRequest = {} as BatchCreateRequest;

  constructor(
    private route: ActivatedRoute,
    private dataService: SamsDataService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.batchId = +params['id'];
      this.dataService.getBatch(this.batchId).subscribe(data => {
        this.batch = data;
        this.updatedBatch = {
          batchName: data.batchName,
          trainingStartDate: data.trainingStartDate,
          trainingEndDate: data.trainingEndDate,
          batchCapacity: data.batchCapacity,
          batchCode: data.batchCode,
          maxCount: data.maxCount,
          description: data.description,
          startDate: data.startDate,
          endDate: data.endDate
        };
      });
    });
  }

  updateBatch(): void {
    this.dataService.updateBatch(this.batchId, this.updatedBatch).subscribe(() => {
      // Optionally, navigate to another page or show a success message
    });
  }
}
