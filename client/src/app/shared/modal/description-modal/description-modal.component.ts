import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-description-modal',
  templateUrl: './description-modal.component.html',
  styleUrls: ['./description-modal.component.css']
})
export class DescriptionModalComponent implements OnInit {
  private modal: HTMLCollection = document.getElementsByClassName('modal');
  @Input('descriptionGroup')
  public descriptionForm: FormGroup;
  @Output() modalOpened = new EventEmitter<{modal: HTMLCollection}>();
  @Output() modalClosed = new EventEmitter<{modal: HTMLCollection}>();

  constructor() { }

  ngOnInit() {
  }

  // Modal Control
  onOpenModal() { // Emitting the HTMLCollection of class names modal.
    this.modalOpened.emit({
      modal: this.modal
    });

  }

  onCloseModal() { // Emitting the HTMLCollection of class names modal.
    this.modalClosed.emit({
      modal: this.modal
    });

  }

}
