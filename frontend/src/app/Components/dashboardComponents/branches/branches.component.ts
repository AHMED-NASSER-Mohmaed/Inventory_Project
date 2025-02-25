import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, signal, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { ConfirmDialogComponent2 } from '../../../confirm-dialog2/confirm-dialog2.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import {MatMenuModule} from '@angular/material/menu';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { decodeToken } from '../../../_helpers/jwt-helper';
import { ToastrService } from 'ngx-toastr';
import { MatSelectModule } from '@angular/material/select';
import { ClerksService } from '../../../_services/clerks.service';
import { BranchesService } from '../../../_services/branches.service';
import { BranchdeactivatewarningComponent } from '../../branchdeactivatewarning/branchdeactivatewarning.component';

@Component({
  selector: 'app-branches',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonToggleModule,
    MatDividerModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    NgxSkeletonLoaderModule,
    MatSelectModule
  ],
  templateUrl: './branches.component.html',
  styleUrl: './branches.component.css'
})
export class BranchesComponent implements OnInit, OnDestroy {
  governates = [
    { id: 1, name: 'Cairo' },
    { id: 2, name: 'Giza' },
    { id: 3, name: 'Alexandria' },
    { id: 4, name: 'Qalyubia' },
    { id: 5, name: 'Beheira' },
    { id: 6, name: 'Dakahlia' },
    { id: 7, name: 'Sharqia' },
    { id: 8, name: 'Gharbia' },
    { id: 9, name: 'Monufia' },
    { id: 10, name: 'Kafr El-Sheikh' },
    { id: 11, name: 'Fayoum' },
    { id: 12, name: 'Beni Suef' },
    { id: 13, name: 'Minya' },
    { id: 14, name: 'Assiut' },
    { id: 15, name: 'Sohag' },
    { id: 16, name: 'Qena' },
    { id: 17, name: 'Luxor' },
    { id: 18, name: 'Aswan' },
    { id: 19, name: 'Red Sea' },
    { id: 20, name: 'New Valley' },
    { id: 22, name: 'Matrouh' },
    { id: 23, name: 'North Sinai' },
    { id: 24, name: 'South Sinai' },
    { id: 25, name: 'Port Said' },
    { id: 26, name: 'Suez' },
    { id: 27, name: 'Ismailia' },
    { id: 28, name: 'Damietta' }
  ];

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  hasNextPage: boolean = false;
  hasPreviousPage: boolean = false;
  selectedGovernate: number | null = null;
  sortDirection: 'asc' | 'desc' | null = null;
  branches: any[] = [];
  isLoading: boolean = true;
  isDarkMode: boolean = false;
  tokenData: any;
  subscriptions: Subscription[] = [];

  // Stats counters
  activeCustomersCount: number | null = null;
  inactiveCustomersCount: number | null = null;

  // UI state
  showNoResults: boolean = false;
  dropdownStates: boolean[] = [];
  editing: boolean = false;
  selectedUser: any = {};
  lastSearchFilter: string = '';
  currentFilter: string = '';

  // Modal data
  newBranch: {
    type: string;
    registrationNumber: string;
    governate: number;
    location: string;
  } = {
    type: '',
    registrationNumber: '',
    governate: 1,
    location: ''
  };

  selectedActivationBranch: string = '';

  users: any[] = [];
  selectedBranch: any = {};

  constructor(
    private branchService: BranchesService,
    public dialog: MatDialog,
    public toaster: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadBranches();
    const token = localStorage.getItem('token');
    if (token) {
      this.tokenData = decodeToken(token);
    }
  }

  hideSingleSelectionIndicator = signal(true);

  loadBranches(): void {
    this.isLoading = true;
    
    let filters = '';
    if (this.currentFilter === 'active') {
      filters = 'isActive:true';
    } else if (this.currentFilter === 'inactive') {
      filters = 'isActive:false';
    }
    
    if (this.selectedGovernate) {
      filters += filters ? `+governate:${this.selectedGovernate}` : `governate:${this.selectedGovernate}`;
    }

    const sortParam = this.sortDirection ? `createdAt:${this.sortDirection}` : undefined;

    this.branchService.getPaginatedBranches(
      this.currentPage,
      this.itemsPerPage,
      this.selectedGovernate ?? undefined,
      sortParam,
      filters || undefined  
    ).subscribe({
      next: (res) => {
        this.branches = res.data.result;
        this.isLoading = false;
      },
      error: (error) => {
        this.toaster.error(error.error.message, 'Error');
        this.isLoading = false;
      }
    });
  }

  onGovernateChange(): void {
    this.currentPage = 1;
    // this.branchService.clearCache(); 
    this.loadBranches();
  }

  toggleSort(): void {
    if (this.sortDirection === null) {
      this.sortDirection = 'asc';
    } else if (this.sortDirection === 'asc') {
      this.sortDirection = 'desc';
    } else {
      this.sortDirection = null;
    }
    this.loadBranches();
  }

  updatePaginationState(): void {
    this.hasNextPage = this.currentPage < this.totalPages;
    this.hasPreviousPage = this.currentPage > 1;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadBranches();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadBranches();
    }
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1;
    this.loadBranches();
  }

  openAddModal(): void {
    this.newBranch = {
      type: '',
      registrationNumber: '',
      governate: 1,
      location: ''
    };
  }

  addAdmin(): void {
    
  }

  addBranch(): void {
    const branchData = {
      governate: this.newBranch.governate,
      location: this.newBranch.location,
      registrationNumber: this.newBranch.registrationNumber
    };

    this.branchService.addBranch(branchData).subscribe({
      next: (response) => {
        this.toaster.success('Branch added successfully');
        
        const modal = document.getElementById('addBranchModal');
        if (modal) {
          (modal as any).style.display = 'none';
          document.body.classList.remove('modal-open');
          const backdrop = document.querySelector('.modal-backdrop');
          if (backdrop) {
            backdrop.remove();
          }
        }

        this.newBranch = {
          type: '',
          registrationNumber: '',
          governate: 1,
          location: ''
        };

        this.branchService.clearCache(); 
        this.currentPage = 1;
        this.selectedGovernate = null;
        this.currentFilter = '';
        this.isLoading = true; 
        this.branches = []; 
        
        setTimeout(() => {
          this.loadBranches();
        }, 100);
      },
      error: (error) => {
        this.toaster.error(error.error.message || 'Error adding branch');
      }
    });
  }

  toggleDropdown(index: number): void {
    this.dropdownStates[index] = !this.dropdownStates[index];
    this.dropdownStates = this.dropdownStates.map((state, i) => i === index ? state : false);
  }

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!event.target.closest('.dropdown')) {
      this.dropdownStates = this.dropdownStates.map(() => false);
    }
  }

  showBranchInfo(branch: any): void {
    this.selectedBranch = { ...branch };
    const governate = this.governates.find(g => g.id === branch.governate);
    this.selectedBranch.governateName = governate ? governate.name : '';
  }

  toggleEdit(event?: any): void {
    if (this.editing) {
      const branchData = {
        registrationNumber: this.selectedBranch.registrationNumber,
        location: this.selectedBranch.location,
        governate: this.selectedBranch.governate
      };
  
      this.branchService.updateCustomer(this.selectedBranch._id, branchData).subscribe({
        next: (response) => {
          this.toaster.success('Branch updated successfully');
          this.editing = false;
          
          const modal = document.getElementById('branchInfoModal');
          if (modal) {
            (modal as any).style.display = 'none';
            document.body.classList.remove('modal-open');
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
              backdrop.remove();
            }
          }
  
          this.branchService.clearCache();
          this.currentPage = 1;
          this.isLoading = true;
          this.branches = [];
          setTimeout(() => {
            this.loadBranches();
          }, 100);
        },
        error: (error) => {
          this.toaster.error(error.error.message || 'Error updating branch');
          this.editing = false;
        }
      });
    } else {
      this.editing = true;
    }
  }

  openConfirmDialog(id: string): void {
    const dialogRef = this.dialog.open(BranchdeactivatewarningComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.branchService.deActiveCustomer(id).subscribe({
          next: () => {
            this.toaster.success('Branch deactivated successfully');
            // Refresh data
            this.branchService.clearCache();
            this.currentPage = 1;
            this.isLoading = true;
            this.branches = [];
            setTimeout(() => {
              this.loadBranches();
            }, 100);
          },
          error: (error) => {
            this.toaster.error(error.error.message || 'Error deactivating branch');
          }
        });
      }
    });
  }

  openActivateAdminModal(branch: any): void {
    this.selectedBranch = branch;
    const dialogRef = this.dialog.open(ConfirmDialogComponent2);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.branchService.activateCustomer(branch._id).subscribe({
          next: () => {
            this.toaster.success('Branch activated successfully');
            this.branchService.clearCache();
            this.currentPage = 1;
            this.isLoading = true;
            this.branches = [];
            setTimeout(() => {
              this.loadBranches();
            }, 100);
          },
          error: (error) => {
            this.toaster.error(error.error.message || 'Error activating branch');
          }
        });
      }
    });
  }

  activateAdminAssignment(): void {
  }

  setFilter(filter: string): void {
    this.currentFilter = this.currentFilter === filter ? '' : filter;
    this.currentPage = 1; 
    this.loadBranches();
  }

  triggerImageUploadSeller(): void {
    document.getElementById('imageUploadSeller')?.click();
  }

  onImageChangeSeller(event: any): void {
    const file = event.target.files[0];
    if (file && this.selectedUser) {
      const formData = new FormData();
      formData.append('image', file);
      this.branchService.changeImage(this.selectedUser._id, file).subscribe({
        next: (res) => {
          if (res.message === 'success') {
            const reader = new FileReader();
            reader.onload = (e: any) => {
              this.selectedUser.photo = { url: e.target.result };
            };
            reader.readAsDataURL(file);
          }
        },
        error: (error) => {
          this.toaster.error(error.error.message, 'Error');
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
