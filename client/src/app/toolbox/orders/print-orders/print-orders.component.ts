import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { ToolboxService } from '../../toolbox.service';

@Component({
  selector: 'app-print-orders',
  templateUrl: './print-orders.component.html',
  styleUrls: ['./print-orders.component.css']
})
export class PrintOrdersComponent implements OnInit {

  constructor(
    private toolboxService: ToolboxService
  ) { }

  ngOnInit() {
  }

  // Search for a specific labels file
  onSearchOrderLabels(form: NgForm) {
    console.log(form.value);
  }

  // Delete this when not needed
  printOrderLabels() {
    this.toolboxService.onTestPrint()
      .subscribe(res => {
        console.log(res)
      })
  }

}
