import { Component, Input } from '@angular/core';
import { Product } from '../../../_models/products';
import { CommonModule } from '@angular/common';
import { Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-quickview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quickview.component.html',
  styleUrls: ['./quickview.component.css']
})
export class QuickviewComponent {
  @Input() isVisible: boolean = false;
  @Input() selectedProduct: Product | any;
  @Output() closeModalEvent = new EventEmitter<void>();

  quantity: number = 1; // Initialize quantity

  closeModal() {
    this.isVisible = false;
    this.closeModalEvent.emit(); // Emit the event when the modal is closed
  }

  increaseQuantity() {
    this.quantity += 1;
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity -= 1;
    }
  }
}