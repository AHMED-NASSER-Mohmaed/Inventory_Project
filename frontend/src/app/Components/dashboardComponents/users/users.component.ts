import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CustomersService } from '../../../_services/customers.service';
import { User } from '../../../_models/user';
import { ConfirmDialogComponent } from '../../../confirm-dialog/confirm-dialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-users',
  imports: [CommonModule , FormsModule , MatDialogModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit , OnDestroy{

  
  constructor(private customerService: CustomersService, public dialog: MatDialog) { }
  dropdownStates: boolean[] = [];
  sub: Subscription = {} as Subscription;
  sub2: Subscription = {} as Subscription;
  sub3: Subscription = {} as Subscription;
  users: User[] = [];
  isDarkMode: boolean = false;

  ngOnInit(): void {
    this.sub = this.customerService.getAllCustomers().subscribe({
      next: (res) => {
        // this.users = res.users.filter((user: User) => user.userType === "customer"); //! this returns all types! , usertype seller doesn't return anything
        this.users = res.users.filter((user: User) => user.kind === "customer"); //! this works
        console.log(res);
        console.log(this.users);
        this.dropdownStates = new Array(this.users.length).fill(false);
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {
        console.log('complete');
      }
    })



  }




  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
  }


  openConfirmDialog(userId: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);

    this.sub3 = dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteUser(userId);
      }
    });
  }
  

  deleteUser(id: string){
    this.sub2 = this.customerService.deleteCustomer(id).subscribe({
      next: (res) => {
        console.log(res);
        this.users = this.users.filter((user) => user._id !== id);
        console.log(this.users);
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {
        console.log('complete');
      }
    })
  }
  

  toggleDropdown(index: number) {
    this.dropdownStates[index] = !this.dropdownStates[index];
  }








  ngOnDestroy(): void {
    if(this.sub){
      this.sub.unsubscribe();
    }

    if(this.sub2){
      this.sub.unsubscribe();
    }

    if(this.sub3){
      this.sub.unsubscribe();
    }

    
  }



  




  

}
