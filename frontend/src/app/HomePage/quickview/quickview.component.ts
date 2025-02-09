import { Component, Input } from '@angular/core';
import { Product } from '../../_models/products';
import { CommonModule } from '@angular/common';
import { Output, EventEmitter } from '@angular/core';
@Component({
  selector: 'app-quickview',
  imports:[CommonModule],
  templateUrl: './quickview.component.html',
  styleUrls: ['./quickview.component.css']
})
export class QuickviewComponent {
  @Input() isVisible: boolean = false;
  @Input() selectedProduct: Product | null = null;
  @Output() closeModalEvent = new EventEmitter<void>();


  closeModal() {

      this.isVisible = false;
      this.closeModalEvent.emit(); // Emit the event when the modal is closed
    }  
  }