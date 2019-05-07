import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatDialogRef } from '@angular/material';
import { map, startWith } from 'rxjs/operators';

@Component({
    selector: 'app-source-dialog',
    templateUrl: './add-source-dialog.component.html',
    styleUrls: ['./add-source-dialog.component.scss']
})
export class AddSourceDialogComponent implements OnInit {

    sourceForm: FormGroup;
    platforms: string[] = ['Google Cloud Storage'];
    filteredPlatforms: Observable<string[]>;

    constructor(public dialogRef: MatDialogRef<AddSourceDialogComponent>, private fb: FormBuilder) {
        this.sourceForm = fb.group({
            platformName: ['Google Cloud Storage', Validators.required],
            path: ['', Validators.required]
        });
        this.sourceForm.controls['platformName'].disable();
    }

    ngOnInit() {
        this.filteredPlatforms = this.sourceForm.get('platformName')!.valueChanges
            .pipe(
                startWith(''),
                map(value => this._filter(value as string))
            );
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onYesClick(): void {
        this.dialogRef.close(this.sourceForm.value);
    }

    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.platforms.filter(option => option.toLowerCase().includes(filterValue));
    }
}
