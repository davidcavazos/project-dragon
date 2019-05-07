import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-view-dialog',
  templateUrl: './view-dialog.component.html',
  styleUrls: ['./view-dialog.component.scss']
})
export class ViewDialogComponent implements OnInit {

  view: any;
  constructor(public dialogRef: MatDialogRef<ViewDialogComponent>) { }
  ngOnInit() {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
