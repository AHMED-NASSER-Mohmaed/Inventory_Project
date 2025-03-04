import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { decodeToken } from '../../../../_helper/jwt-helper';
import { SellerAnalyticsService } from '../../../../_services/seller-analytics.service';

@Component({
  selector: 'app-analtics',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxSkeletonLoaderModule, BaseChartDirective],
  templateUrl: './analtics.component.html',
  styleUrl: './analtics.component.css'
})
export class AnalticsComponent implements OnInit, OnDestroy {
  tokenData: any;
  isDarkMode: boolean = false;
  isLoading: boolean = true;
  
  analyticsData: any = null;
  
  // Chart data for order status
  orderStatusChartData: ChartData<'pie'> = {
    labels: [],
    datasets: []
  };
  
  // Chart data for monthly revenue (if available)
  monthlyRevenueChartData: ChartData<'line'> = {
    labels: [],
    datasets: []
  };
  
  // Chart options
  pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      }
    }
  };
  
  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Revenue ($)'
        }
      }
    }
  };
  
  // Chart types
  pieChartType: ChartType = 'pie';
  lineChartType: ChartType = 'line';
  
  private subscriptions: Subscription[] = [];

  constructor(
    private sellerAnalytics: SellerAnalyticsService,
    public dialog: MatDialog,
    public toaster: ToastrService
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.tokenData = decodeToken(token);
    }
    
    this.loadAnalyticsData();
  }
  
  loadAnalyticsData(): void {
    this.isLoading = true;
    const sub = this.sellerAnalytics.getSellerAnalytics().subscribe({
      next: (response) => {
        console.log("Seller analytics data:", response);
        this.analyticsData = response.data;
        this.prepareChartData();
        this.isLoading = false;
      },
      error: (error) => {
        this.toaster.error('Failed to load analytics data', 'Error');
        console.error('Error loading analytics data:', error);
        this.isLoading = false;
      }
    });
    this.subscriptions.push(sub);
  }
  
  prepareChartData(): void {
    if (this.analyticsData?.orderStats && this.analyticsData.orderStats.length > 0) {
      const statusLabels = this.analyticsData.orderStats.map((item: any) => 
        item._id.charAt(0).toUpperCase() + item._id.slice(1));
      const statusData = this.analyticsData.orderStats.map((item: any) => item.count);
      
      this.orderStatusChartData = {
        labels: statusLabels,
        datasets: [{
          data: statusData,
          backgroundColor: ['#ff6b6b', '#4ecdc4', '#ffd166', '#6a0572', '#1b9aaa']
        }]
      };
    }
    
    if (this.analyticsData?.monthlyRevenue && this.analyticsData.monthlyRevenue.length > 0) {
      const labels = this.analyticsData.monthlyRevenue.map((item: any) => 
        `${this.getMonthName(item._id.month)} ${item._id.year}`);
      const data = this.analyticsData.monthlyRevenue.map((item: any) => item.totalRevenue);
      
      this.monthlyRevenueChartData = {
        labels: labels,
        datasets: [{
          data: data,
          label: 'Monthly Revenue',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.3,
          fill: false
        }]
      };
    }
  }
  
  getMonthName(monthNumber: number): string {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return months[monthNumber - 1] || '';
  }
  
  getTotalRevenue(): number {
    if (!this.analyticsData?.monthlyRevenue || this.analyticsData.monthlyRevenue.length === 0) return 0;
    return this.analyticsData.monthlyRevenue.reduce(
      (sum: number, item: any) => sum + item.totalRevenue, 0
    );
  }
  
  getTotalOrders(): number {
    if (!this.analyticsData?.orderStats) return 0;
    return this.analyticsData.orderStats.reduce(
      (sum: number, item: any) => sum + item.count, 0
    );
  }
  
  getTotalProducts(): number {
    if (!this.analyticsData?.topProducts) return 0;
    return this.analyticsData.topProducts.length;
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
  }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
