import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatDialogRef } from '@angular/material';

@Component({
    selector: 'app-train-dialog',
    templateUrl: './train-dialog.component.html',
    styleUrls: ['./train-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class TrainDialogComponent implements OnInit {

    sourceForm: FormGroup;
    platforms: string[] = ['Google Drive'];
    filteredPlatforms: Observable<string[]>;

    constructor(public dialogRef: MatDialogRef<TrainDialogComponent>, private fb: FormBuilder) {
        this.sourceForm = fb.group({
            hours: ['1', Validators.required],
            username: ['', Validators.required]
        });
        //this.sourceForm.controls['platformName'].disable();
    }

    ngOnInit() {
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onYesClick(): void {
        this.dialogRef.close(this.sourceForm.value);
    }
}

// function agerangevalidator(control: abstractcontrol): { [key: string]: boolean } | null {
//     if (control.value !== undefined && (isnan(control.value) || control.value < 18 || control.value > 45)) {
//         return { 'agerange': true };
//     }
//     return null;
// } 