import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CustomersProfileService } from '../../_services/customer-profile.service';
import { Account } from '../../_models/account';

@Component({
  selector: 'app-userprofile',
  templateUrl: './userprofile.component.html',
  imports: [FormsModule , CommonModule],
  styleUrls: ['./userprofile.component.css']
})
export class UserprofileComponent implements AfterViewInit , OnInit {

  constructor(public customerProfileService: CustomersProfileService){}

  isEditing = false;
  sub = {} as Subscription;


  user = {} as Account;
  userP : string = '';

  ngOnInit(): void {
    this.sub = this.customerProfileService.getMe().subscribe({
      next: (res: any) => {
        console.log(res);
        this.user = res.user;
        this.userP = res.user.photo.url;
        console.log(this.userP);
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {
        console.log('Get Me Complete');
      }
    })
  }





  ngAfterViewInit() {
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        document.querySelectorAll('.rightbox > div')
          .forEach(div => div.classList.add('noshow'));
        
        const sectionId = '.' + link.id;
        document.querySelector(sectionId)?.classList.remove('noshow');
      });
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  handleSaveClick() {
    if (this.isEditing) {
      this.saveChanges();
      this.toggleEdit();
    } else {
      this.toggleEdit();
    }
  }

  saveChanges() {
    console.log("lol")
  }

  triggerImageUpload() {
    document.getElementById('imageUpload')?.click();
  }

  onImageChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        document.querySelector('.firstImage')?.setAttribute('src', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }
  
}