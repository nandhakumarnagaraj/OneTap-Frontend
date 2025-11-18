import { Routes } from '@angular/router';
import { EditBatchComponent } from './edit-batch/edit-batch';

export const routes: Routes = [
    { path: 'edit-batch/:id', component: EditBatchComponent },
    { path: '', redirectTo: '/edit-batch/1', pathMatch: 'full' }
];
