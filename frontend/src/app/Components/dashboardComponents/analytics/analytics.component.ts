import { Component, OnInit, OnDestroy } from '@angular/core';
import { decodeToken } from '../../../_helpers/jwt-helper';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { SAanalsisService } from '../../../_services/saanalsis.service';
import { Subscription } from 'rxjs';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxSkeletonLoaderModule, BaseChartDirective],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.css',
})
export class AnalyticsComponent implements OnInit, OnDestroy {
  tokenData: any;
  isDarkMode: boolean = false;
  isLoading: boolean = true;
  
  analyticsData: any = null;
  
  monthlySignUpsChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };
  
  monthlyRevenueChartData: ChartData<'line'> = {
    labels: [],
    datasets: []
  };
  
  productStatusChartData: ChartData<'pie'> = {
    labels: [],
    datasets: []
  };

  revenueBySellerChartData: ChartData = {
    labels: [],
    datasets: []
  };
  
  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };
  
  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true
  };
  
  pieChartOptions: ChartConfiguration['options'] = {
    responsive: true
  };

  revenueBySellerOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: {
        position: 'left',
        beginAtZero: true,
        title: {
          display: true,
          text: 'Revenue ($)'
        }
      },
      y1: {
        position: 'right',
        beginAtZero: true,
        grid: {
          drawOnChartArea: false, 
        },
        title: {
          display: true,
          text: 'Order Count'
        }
      }
    }
  };
  
  barChartType: ChartType = 'bar';
  lineChartType: ChartType = 'line';
  pieChartType: ChartType = 'pie';
  
  private subscriptions: Subscription[] = [];

  constructor(
    private superAdminAnalysisService: SAanalsisService,
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
    const sub = this.superAdminAnalysisService.getAdminAnalytics().subscribe({
      next: (response) => {
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
    if (this.analyticsData?.monthlySignUps) {
      const labels = this.analyticsData.monthlySignUps.map((item: any) => 
        `${this.getMonthName(item._id.month)} ${item._id.year}`);
      const data = this.analyticsData.monthlySignUps.map((item: any) => item.count);
      
      this.monthlySignUpsChartData = {
        labels: labels,
        datasets: [{
          data: data,
          label: 'New Users',
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgb(54, 162, 235)'
        }]
      };
    }
    
    if (this.analyticsData?.monthlyRevenue) {
      const labels = this.analyticsData.monthlyRevenue.map((item: any) => 
        `${this.getMonthName(item._id.month)} ${item._id.year}`);
      const data = this.analyticsData.monthlyRevenue.map((item: any) => item.totalRevenue);
      
      this.monthlyRevenueChartData = {
        labels: labels,
        datasets: [{
          data: data,
          label: 'Revenue',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.2
        }]
      };
    }
    
    if (this.analyticsData?.productsStatusSummary) {
      const labels = this.analyticsData.productsStatusSummary.map((item: any) => 
        item._id.charAt(0).toUpperCase() + item._id.slice(1));
      const data = this.analyticsData.productsStatusSummary.map((item: any) => item.count);
      
      this.productStatusChartData = {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: ['#E74C3C', '#3498DB', '#2ECC71', '#F39C12']
        }]
      };
    }

    if (this.analyticsData?.revenueBySeller && this.analyticsData.revenueBySeller.length > 0) {
      const labels = this.analyticsData.revenueBySeller.map((item: any) => 
        `${item.sellerDetails.firstName} ${item.sellerDetails.lastName}`);
      const revenueData = this.analyticsData.revenueBySeller.map((item: any) => item.totalRevenue);
      const orderData = this.analyticsData.revenueBySeller.map((item: any) => item.orderCount);
      
      this.revenueBySellerChartData = {
        labels: labels,
        datasets: [
          {
            data: revenueData,
            label: 'Total Revenue ($)',
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgb(54, 162, 235)',
            yAxisID: 'y',
            type: 'bar' 
          },
          {
            data: orderData,
            label: 'Order Count',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgb(255, 99, 132)',
            yAxisID: 'y1',
            type: 'line' 
          }
        ]
      };
    }
  }
  
  getMonthName(monthNumber: number): string {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return months[monthNumber - 1] || '';
  }
  
  getTotalRevenue(): number {
    if (!this.analyticsData?.monthlyRevenue) return 0;
    return this.analyticsData.monthlyRevenue.reduce(
      (sum: number, item: any) => sum + item.totalRevenue, 0
    );
  }
  
  getTotalSignUps(): number {
    if (!this.analyticsData?.monthlySignUps) return 0;
    return this.analyticsData.monthlySignUps.reduce(
      (sum: number, item: any) => sum + item.count, 0
    );
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
  }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
