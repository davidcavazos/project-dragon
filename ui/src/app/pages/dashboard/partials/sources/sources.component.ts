import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { MatDialog, MatDialogConfig } from "@angular/material";

import { AddSourceDialogComponent } from "./add-source-dialog/add-source-dialog.component";
import { TrainDialogComponent } from "./train-dialog/train-dialog.component";
import { VisionService } from 'src/app/services/api/vision.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-sources',
    templateUrl: './sources.component.html',
    styleUrls: ['./sources.component.scss']
})
export class SourcesComponent implements OnInit {
    @Input() sourceList: string[];
    @Input() isClassificationResultReady: boolean;
    @Output() newSource = new EventEmitter<any>();
    @Output() deleteSource = new EventEmitter<any>();
    @Output() selectedSources = new EventEmitter<Array<string>>();

    sourceObject: string;
    form: FormGroup;

    constructor(private dialog: MatDialog, private _vision: VisionService, private fb: FormBuilder) {
        this.form = fb.group({
            selSrc: ['', Validators.required]
        })
    }

    ngOnInit() {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.isClassificationResultReady && changes.isClassificationResultReady.currentValue != changes.isClassificationResultReady.previousValue && !changes.isClassificationResultReady.currentValue) {
            this.form.controls['selSrc'].reset();
        }
    }

    verifyAndAddSource = () => {
        const dialogConfig = new MatDialogConfig();

        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;

        const dialogRef = this.dialog.open(AddSourceDialogComponent, dialogConfig);

        dialogRef.afterClosed().subscribe(val => {
            if (val) {
                let newSourcePath = `gs://${val.path}`;
                if (this.sourceList.indexOf(newSourcePath) > -1) {
                    alert(`"${newSourcePath}" is already added as source.`);
                } else {
                    this.newSource.emit({
                        name: val.path,
                        path: newSourcePath,
                        type: 'gcp'
                    });
                }
            }
        });
    }

    deleteSourceClick = (path) => {
        this.deleteSource.emit(path);
    }

    onSourceSelect = (value) => {
        this.selectedSources.emit([value.split('//')[1]]);
    }

    train = () => {
        const dialogConfig = new MatDialogConfig();

        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;

        const dialogRef = this.dialog.open(TrainDialogComponent, dialogConfig);

        dialogRef.afterClosed().subscribe(formData => {
            if (formData) {
                this._vision.trainModel({ TrainingTime: parseFloat(formData.hours) }).subscribe(res => {
                    console.log("training started!");
                })
            }
        });
    }
}
