import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { decodeToken } from '../../_helper/jwt-helper';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule,CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent  implements OnInit {
  tokenData: any=null;
   token= localStorage.getItem("token");
  ngOnInit(): void {
 
    if(this.token){

      this.tokenData=decodeToken(this.token);
      console.log(this.tokenData);
    }

  }




}
