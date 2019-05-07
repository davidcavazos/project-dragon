import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { map, startWith } from 'rxjs/operators';

@Component({
    selector: 'app-filter-dialog',
    templateUrl: './filter-dialog.component.html',
    styleUrls: ['./filter-dialog.component.scss']
})
export class FilterDialogComponent implements OnInit {

    filterForm: FormGroup;
    options: string[] = [];
    filteredOptions: Observable<string[]>;
    operators: string[] = ['is populated', '==', '!=', '<=', '>=', '<', '>'];
    isPopulatedOperatorSelected: boolean = true;

    constructor(public dialogRef: MatDialogRef<FilterDialogComponent>, @Inject(MAT_DIALOG_DATA) options: any, private fb: FormBuilder) {
        this.options = options.autoSuggestOptions;
        this.filterForm = fb.group({
            key: ['', Validators.required],
            operator: ['is populated', Validators.required],
            value: ['', null]
        });
    }

    subscribeOperatorChanges() {

        const changes$ = this.filterForm.get('operator')!.valueChanges;
        changes$.subscribe(operator => {
            if (operator === 'is populated') {
                this.isPopulatedOperatorSelected = true;
                this.filterForm.controls['value'].setValidators(null);
                this.filterForm.controls['value'].updateValueAndValidity();
            } else {
                this.isPopulatedOperatorSelected = false;
                this.filterForm.controls['value'].setValidators(Validators.required);
                this.filterForm.controls['value'].updateValueAndValidity();
            }
        });
    }

    ngOnInit() {
        this.filteredOptions = this.filterForm.get('key')!.valueChanges
            .pipe(
                startWith(''),
                map(value => this._filter(value as string))
            );
        this.subscribeOperatorChanges();
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onYesClick(): void {
        this.dialogRef.close(this.filterForm.value);
    }

    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.options.filter(option => option.toLowerCase().includes(filterValue));
    }
}
