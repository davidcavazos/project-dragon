import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";

import { IBlock } from '../../../../../models/block';

@Component({
    selector: 'app-dialog',
    templateUrl: './dialog.component.html',
    styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {
    form: FormGroup;
    title: string;
    options: string[] = [];
    filteredOptions: Observable<string[]>;

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<DialogComponent>,
        @Inject(MAT_DIALOG_DATA) { dcoumentPath, classificationType, classificationScore, columnName, columnValue, autoSuggestOptions }: IBlock) {
        this.title = `${classificationType} : ${classificationScore}`;
        this.options = autoSuggestOptions;
        this.form = fb.group({
            columnValue: [columnValue, Validators.required],
            columnName: [columnName, Validators.required]
        });
    }

    ngOnInit() {
        this.filteredOptions = this.form.get('columnName')!.valueChanges
            .pipe(
                startWith(''),
                map(value => this._filter(value))
            );
    }

    save() {
        this.dialogRef.close(this.form.value);
    }

    close() {
        this.dialogRef.close();
    }

    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.options.filter(option => option.toLowerCase().includes(filterValue));
    }
}
