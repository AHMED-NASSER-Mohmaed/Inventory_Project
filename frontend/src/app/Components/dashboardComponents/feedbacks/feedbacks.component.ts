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
  activeFeedbacksCount: number = 0;
  inactiveFeedbacksCount: number = 0;
  seenFeedbacksCount: number = 0;
  unseenFeedbacksCount: number = 0;

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
    if (this.currentFilter === 'seen') filters.push('isSeen:true');
    if (this.currentFilter === 'pending') filters.push('isSeen:false');
    if (this.selectedDot === 'active') filters.push('isActive:true');
    if (this.selectedDot === 'inactive') filters.push('isActive:false');
    
    return `page_${this.currentPage}_limit_${this.itemsPerPage}_filters_${filters.join('+')}_sort_${this.sortField || 'none'}_${this.sortDirection || 'none'}`;
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  constructor(private feedbackService: FeedbacksService, public dialog: MatDialog) {
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
    this.showNoResults = false; 
    
    const cacheKey = this.getCacheKey();
    
    if (this.cache[cacheKey] && this.isCacheValid(this.cache[cacheKey].timestamp)) {
      this.feedbacks = this.cache[cacheKey].data;
      this.showNoResults = this.feedbacks.length === 0; 
      this.totalPages = Math.ceil(this.cache[cacheKey].total / this.itemsPerPage);
      this.dropdownStates = new Array(this.feedbacks.length).fill(false);
      this.updatePaginationState();
      this.isLoading = false;
      return;
    }

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

  markAsSeen(id: string): void {
    this.feedbackService.markAsSeen(id).subscribe({
      next: () => {
        this.loadFeedbacks();
        this.updateCounts();
      },
      error: (error) => console.error('Error marking feedback as seen:', error)
    });
  }

  deleteFeedback(id: string): void {
    this.feedbackService.deleteFeedback(id).subscribe({
      next: () => {
        this.loadFeedbacks();
        this.updateCounts();
      },
      error: (error) => console.error('Error deleting feedback:', error)
    });
  }

  sendAutoReply(id: string): void {
    this.feedbackService.sendAutoReply(id).subscribe({
      next: () => {
      },
      error: (error) => console.error('Error sending auto reply:', error)
    });
  }

  sendReply(id: string, reply: string): void {
    this.feedbackService.sendReply(id, reply).subscribe({
      next: () => {
      },
      error: (error) => console.error('Error sending reply:', error)
    });
  }

  updateCounts(): void {
    const subs = [
      this.feedbackService.getActiveFeedbacksCount().subscribe(res => this.activeFeedbacksCount = res.count),
      this.feedbackService.getInactiveFeedbacksCount().subscribe(res => this.inactiveFeedbacksCount = res.count),
      this.feedbackService.getSeenFeedbacksCount().subscribe(res => this.seenFeedbacksCount = res.count),
      this.feedbackService.getUnseenFeedbacksCount().subscribe(res => this.unseenFeedbacksCount = res.count)
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
          if ((this.currentFilter === 'seen' && feedback.isSeen) || 
              (this.currentFilter === 'pending' && !feedback.isSeen)) {
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
    this.cache = {}; // Clear cache when changing items per page
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
    this.currentActiveStatus = true;
    this.searchPlaceholder = 'Search All Feedbacks by ID...';
    this.selectedDot = null;
    this.loadFeedbacks();
    this.updateCounts();
  }

  onStatusDotClick(status: boolean): void {
    this.cache = {}; 
    this.currentActiveStatus = status;
    this.selectedDot = status ? 'active' : 'inactive';
    let filters = `isActive:${status}`;
    
    if (this.currentFilter === 'seen') {
      filters += '+isSeen:true';
    } else if (this.currentFilter === 'pending') {
      filters += '+isSeen:false';
    }

    this.searchPlaceholder = `Search ${status ? 'Active' : 'Inactive'} ${this.currentFilter === 'seen' ? 'Seen' : 'Pending'} Feedback by ID...`;
    
    this.isLoading = true;
    this.currentPage = 1;
    
    const sub = this.feedbackService.getFeedbacks(
      this.currentPage,
      this.itemsPerPage,
      filters,
      this.sortField && this.sortDirection ? `&sort=${this.sortField}:${this.sortDirection}` : ''
    ).subscribe({
      next: (res) => {
        this.feedbacks = res.result.result;
        this.totalPages = Math.ceil(res.result.total / this.itemsPerPage);
        this.dropdownStates = new Array(this.feedbacks.length).fill(false);
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

}
