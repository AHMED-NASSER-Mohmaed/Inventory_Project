import { Component } from '@angular/core';
import { HeaderComponent } from "../../core/header/header.component";
import { RouterLink } from '@angular/router';
import { FooterComponent } from "../../core/footer/footer.component";
@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
  standalone: true,
  imports: [HeaderComponent, RouterLink, FooterComponent]
})
export class AboutComponent {

}
