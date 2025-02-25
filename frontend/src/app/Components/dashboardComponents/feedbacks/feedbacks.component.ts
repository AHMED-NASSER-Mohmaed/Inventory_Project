import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Feedback } from '../../../_models/feedback';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import {MatMenuModule} from '@angular/material/menu';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { decodeToken } from '../../../_helpers/jwt-helper';
import { FeedbacksService } from '../../../_services/feedbacks.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmDialogComponent2 } from '../../../confirm-dialog2/confirm-dialog2.component';

interface SearchResponse {
  data: {
    result: Feedback[];
    total: number;
  };
}

interface FeedbackResponse {
  status: string;
  data: Feedback;
}

@Component({
  selector: 'app-feedbacks',
  imports: [CommonModule, FormsModule, MatButtonToggleModule, MatDividerModule , MatMenuModule , MatProgressSpinnerModule , NgxSkeletonLoaderModule],
  templateUrl: './feedbacks.component.html',
  styleUrl: './feedbacks.component.css'
})

export class FeedbacksComponent implements OnInit, OnDestroy{

  currentFilter: 'seen' | 'pending' | null = null;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  hasNextPage: boolean = false;
  hasPreviousPage: boolean = false;

  feedbacks: Feedback[] = [];
  isDarkMode: boolean = false;
  dropdownStates: boolean[] = [];
  selectedFeedback: Feedback = {} as Feedback;

  // Totals
  activeFeedbacksCount: any;
  inactiveFeedbacksCount: any;
  seenFeedbacksCount: any;
  unseenFeedbacksCount: any;

  subscriptions: Subscription[] = [];
  pageCache: { [key: string]: { result: Feedback[]; total: number } } = {};

  searchQuery: string = '';

  showNoResults: boolean = false;

  isLoading: boolean = true;

  sortField: 'createdAt' | null = null;
  sortDirection: 'asc' | 'desc' | null = null;

  hideSingleSelectionIndicator = signal(true);

  tokenData: any = null;
  searchPlaceholder: string = 'Search All Feedbacks by ID...';
  replyMessage: string = '';

  currentActiveStatus: boolean = true;

  selectedDot: 'active' | 'inactive' | null = null;

  // Add cache interfaces
  private cache: {
    [key: string]: {
      data: Feedback[];
      total: number;
      timestamp: number;
    }
  } = {};

  private readonly CACHE_DURATION = 5 * 60 * 1000; 

  private getCacheKey(): string {
    const filters = [];
    
    // Add active/inactive status if selected
    if (this.selectedDot === 'active') {
      filters.push('isActive:true');
    } else if (this.selectedDot === 'inactive') {
      filters.push('isActive:false');
    }
    
    // Add seen/pending status if selected
    if (this.currentFilter === 'seen') {
      filters.push('isSeen:true');
    } else if (this.currentFilter === 'pending') {
      filters.push('isSeen:false');
    }

    // Sort filters for consistent cache keys
    filters.sort();

    const cacheKey = [
      `page_${this.currentPage}`,
      `limit_${this.itemsPerPage}`,
      filters.length > 0 ? `filters_${filters.join('+')}` : 'no_filters',
      `sort_${this.sortField || 'none'}_${this.sortDirection || 'none'}`
    ].join('_');

    console.log('Cache key:', cacheKey); // Debug log
    return cacheKey;
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  constructor(
    private feedbackService: FeedbacksService, 
    public dialog: MatDialog,
    private toastr: ToastrService
  ) {
    const token = localStorage.getItem('token');
    if (token) {
      this.tokenData = decodeToken(token);
    }
    this.searchPlaceholder = 'Search All Feedbacks by ID...';
  }

  ngOnInit(): void {
    this.loadFeedbacks();
    this.updateCounts();
  }

  loadFeedbacks(): void {
    this.isLoading = true;
    this.showNoResults = false; // Reset at start
    this.feedbacks = []; // Clear existing feedbacks
    
    const cacheKey = this.getCacheKey();
    console.log('Checking cache for key:', cacheKey); // Debug log
    console.log('Current cache:', this.cache); // Debug log
    
    if (this.cache[cacheKey] && this.isCacheValid(this.cache[cacheKey].timestamp)) {
      console.log('Cache hit!'); // Debug log
      this.feedbacks = [...this.cache[cacheKey].data]; // Use spread to create new array
      this.showNoResults = this.feedbacks.length === 0; 
      this.totalPages = Math.ceil(this.cache[cacheKey].total / this.itemsPerPage);
      this.dropdownStates = new Array(this.feedbacks.length).fill(false);
      this.updatePaginationState();
      this.isLoading = false;
      return;
    }

    console.log('Cache miss - fetching from server'); // Debug log

    const filters = [];
    if (this.currentFilter === 'seen') filters.push('isSeen:true');
    if (this.currentFilter === 'pending') filters.push('isSeen:false');
    if (this.selectedDot === 'active') filters.push('isActive:true');
    if (this.selectedDot === 'inactive') filters.push('isActive:false');

    const filterString = filters.length > 0 ? filters.join('+') : '';
    let sortParam = '';
    if (this.sortField && this.sortDirection) {
      sortParam = `&sort=${this.sortField}:${this.sortDirection}`;
    }

    const sub = this.feedbackService.getFeedbacks(
      this.currentPage,
      this.itemsPerPage,
      filterString,
      sortParam
    ).subscribe({
      next: (res) => {
        this.feedbacks = res.result.result;
        this.showNoResults = this.feedbacks.length === 0; 
        this.totalPages = Math.ceil(res.result.total / this.itemsPerPage);
        this.dropdownStates = new Array(this.feedbacks.length).fill(false);
        
        this.cache[cacheKey] = {
          data: this.feedbacks,
          total: res.result.total,
          timestamp: Date.now()
        };
        
        this.updatePaginationState();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading feedbacks:', error);
        this.showNoResults = true; 
        this.feedbacks = [];
        this.isLoading = false;
      }
    });
    this.subscriptions.push(sub);
  }

  // markAsSeen(id: string): void {
  //   this.feedbackService.markAsSeen(id).subscribe({
  //     next: () => {
  //       this.toastr.success('Feedback marked as seen successfully');
  //       this.refreshCurrentView(); 
  //       this.updateCounts();
  //     },
  //     error: (error) => {
  //       console.error('Error marking feedback as seen:', error);
  //       this.toastr.error('Error marking feedback as seen');
  //     }
  //   });
  // }

  setSelectedFeedback(feedback: Feedback): void {
    this.selectedFeedback = { ...feedback };
  }

  deleteFeedback(feedback: Feedback): void {
    this.setSelectedFeedback(feedback);
    const dialogRef = this.dialog.open(ConfirmDialogComponent2);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.feedbackService.deleteFeedback(feedback._id).subscribe({
          next: () => {
            this.toastr.success('Feedback archived successfully');
            this.refreshCurrentView(); 
            this.updateCounts();
          },
          error: (error) => {
            console.error('Error archiving feedback:', error);
            this.toastr.error('Error archiving feedback');
          }
        });
      }
    });
  }

  sendAutoReply(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent2);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.feedbackService.sendAutoReply(id).subscribe({
          next: () => {
            this.toastr.success('Auto-reply sent successfully');
            this.refreshCurrentView(); 
          },
          error: (error) => {
            console.error('Error sending auto reply:', error);
            this.toastr.error('Error sending auto-reply');
          }
        });
      }
    });
  }

  sendReply(id: string, reply: string): void {
    if (!reply.trim()) {
      this.toastr.warning('Please enter a reply message');
      return;
    }

    this.feedbackService.sendReply(id, reply).subscribe({
      next: () => {
        this.toastr.success('Reply sent successfully');
        const modal = document.getElementById('replyModal');
        if (modal) {
          (modal as any).style.display = 'none'; 
          document.body.classList.remove('modal-open'); 
          const backdrop = document.querySelector('.modal-backdrop');
          if (backdrop) {
            backdrop.remove(); 
          }
        }
        this.replyMessage = ''; 
        this.refreshCurrentView(); 
      },
      error: (error) => {
        console.error('Error sending reply:', error);
        this.toastr.error('Error sending reply');
      }
    });
  }

  updateCounts(): void {
    const subs = [
      this.feedbackService.getActiveFeedbacksCount().subscribe(res => this.activeFeedbacksCount = res.data),
      this.feedbackService.getInactiveFeedbacksCount().subscribe(res => this.inactiveFeedbacksCount = res.data),
      this.feedbackService.getSeenFeedbacksCount().subscribe(res => this.seenFeedbacksCount = res.data),
      this.feedbackService.getUnseenFeedbacksCount().subscribe(res => this.unseenFeedbacksCount = res.data)
    ];
    this.subscriptions.push(...subs);
  }

  updatePaginationState(): void {
    this.hasNextPage = this.currentPage < this.totalPages;
    this.hasPreviousPage = this.currentPage > 1;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      if (this.isSearchMode) {
        this.loadSearchResults();
      } else {
        this.loadFeedbacks();
      }
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      if (this.isSearchMode) {
        this.loadSearchResults();
      } else {
        this.loadFeedbacks();
      }
    }
  }

  setFilter(filter: 'seen' | 'pending' | null): void {
    this.currentFilter = filter;
    this.currentPage = 1;
    this.isSearchMode = false;
    this.searchQuery = '';
    this.showNoResults = false; 
    this.feedbacks = []; 
    
    const activeState = this.selectedDot === 'active' ? 'Active' : 
                       this.selectedDot === 'inactive' ? 'Inactive' : 'All';
    const filterState = filter === 'seen' ? 'Seen' : 
                       filter === 'pending' ? 'Pending' : 'All';
    this.searchPlaceholder = `Search ${activeState} ${filterState} Feedback by ID...`;
    
    this.loadFeedbacks();
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
  }

  toggleDropdown(index: number): void {
    this.dropdownStates = this.dropdownStates.map((state, i) => i === index ? !state : false);
  }

  isSearchMode: boolean = false;
  
  onSearch(event: Event) {
    event.preventDefault();
    if (!this.searchQuery.trim()) {
      this.isSearchMode = false;
      this.loadFeedbacks();
      return;
    }

    this.isSearchMode = true;
    this.currentPage = 1;
    this.loadSearchResults();
  }

  resetSearch(): void {
    this.cache = {}; 
    this.searchQuery = '';
    this.isSearchMode = false;
    this.currentFilter = 'pending';
    this.currentPage = 1;
    this.sortField = null;
    this.sortDirection = null;
    this.loadFeedbacks();
  }

  validateSearchInput(event: KeyboardEvent): boolean {
    const pattern = /^[0-9a-fA-F]$/;
    if (!pattern.test(event.key)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  handlePaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text') || '';
    if (/^[0-9a-fA-F]{24}$/.test(pastedText)) {
      this.searchQuery = pastedText;
    }
  }

  loadSearchResults(): void {
    this.isLoading = true;
    this.showNoResults = false;
    this.feedbacks = [];
    
    const sub = this.feedbackService.getFeedbackById(this.searchQuery).subscribe({
      next: (res: FeedbackResponse) => {
        if (res.data) {
          const feedback = res.data;
          const matchesSeenStatus = this.currentFilter === null || 
                                  (this.currentFilter === 'seen' && feedback.isSeen) || 
                                  (this.currentFilter === 'pending' && !feedback.isSeen);
          
          const matchesActiveStatus = this.selectedDot === null ||
                                    (this.selectedDot === 'active' && feedback.isActive) ||
                                    (this.selectedDot === 'inactive' && !feedback.isActive);

          if (matchesSeenStatus && matchesActiveStatus) {
            this.feedbacks = [feedback];
            this.showNoResults = false;
          } else {
            this.showNoResults = true;
          }
          this.totalPages = 1;
          this.dropdownStates = new Array(this.feedbacks.length).fill(false);
          this.updatePaginationState();
        }
        this.isLoading = false;
      },
      error: (error: Error) => {
        console.error('Error searching feedback:', error);
        this.feedbacks = [];
        this.showNoResults = true;
        this.updatePaginationState();
        this.isLoading = false;
      }
    });
    
    this.subscriptions.push(sub);
  }

  onItemsPerPageChange(): void {
    this.cache = {}; 
    this.currentPage = 1; 
    this.pageCache = {};
    if (this.isSearchMode) {
      this.loadSearchResults();
    } else {
      this.loadFeedbacks();
    }
  }

  toggleSort(field: 'createdAt'): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    this.currentPage = 1;
    
    if (this.isSearchMode) {
      this.loadSearchResults();
    } else {
      this.loadFeedbacks();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  resetAll(): void {
    this.cache = {}; 
    this.searchQuery = '';
    this.isSearchMode = false;
    this.currentFilter = null; 
    this.sortField = null;
    this.sortDirection = null;
    this.currentPage = 1;
    this.showNoResults = false;
    this.feedbacks = []; 
    this.currentActiveStatus = true;
    this.searchPlaceholder = 'Search All Feedbacks by ID...';
    this.selectedDot = null;
    this.loadFeedbacks();
    this.updateCounts();
  }

  onStatusDotClick(status: boolean): void {
    this.currentActiveStatus = status;
    this.selectedDot = status ? 'active' : 'inactive';
    this.showNoResults = false; 
    this.feedbacks = []; 
    
    // Build filters string
    const filters = [];
    filters.push(`isActive:${status}`);
    
    if (this.currentFilter === 'seen') {
      filters.push('isSeen:true');
    } else if (this.currentFilter === 'pending') {
      filters.push('isSeen:false');
    }

    const filterString = filters.join('+');
    this.searchPlaceholder = `Search ${status ? 'Existing' : 'Archived'} ${this.currentFilter === 'seen' ? 'Seen' : 'Pending'} Feedback by ID...`;
    
    this.isLoading = true;
    this.currentPage = 1;
    
    // Always store in cache after successful request
    const sub = this.feedbackService.getFeedbacks(
      this.currentPage,
      this.itemsPerPage,
      filterString,
      this.sortField && this.sortDirection ? `&sort=${this.sortField}:${this.sortDirection}` : ''
    ).subscribe({
      next: (res) => {
        this.feedbacks = res.result.result;
        this.totalPages = Math.ceil(res.result.total / this.itemsPerPage);
        this.dropdownStates = new Array(this.feedbacks.length).fill(false);
        
        // Store in cache
        const cacheKey = this.getCacheKey();
        this.cache[cacheKey] = {
          data: this.feedbacks,
          total: res.result.total,
          timestamp: Date.now()
        };
        
        this.updatePaginationState();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error filtering feedbacks:', error);
        this.isLoading = false;
      }
    });
    
    this.subscriptions.push(sub);
  }

  getNoResultsMessage(): string {
    const parts: string[] = [];

    if (this.selectedDot === 'active') {
      parts.push('Active');
    } else if (this.selectedDot === 'inactive') {
      parts.push('Inactive');
    }

    if (this.currentFilter === 'seen') {
      parts.push('Seen');
    } else if (this.currentFilter === 'pending') {
      parts.push('Pending');
    }

    if (parts.length === 0) {
      return 'No Feedbacks Found';
    }

    return `No ${parts.join(' ')} Feedbacks Yet`;
  }

  private refreshCurrentView(): void {
    this.isLoading = true;
    this.feedbacks = [];
    this.showNoResults = false;
    this.cache = {}; // Clear cache on refresh
    
    setTimeout(() => {
      if (this.isSearchMode) {
        this.loadSearchResults();
      } else {
        this.loadFeedbacks();
      }
    }, 300);
  }

}
