import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { MatDialog } from '@angular/material';

import { FilterDialogComponent } from './filter-dialog/filter-dialog.component';
import { Filter } from '../../../../models/filter';

@Component({
    selector: 'app-filters',
    templateUrl: './filters.component.html',
    styleUrls: ['./filters.component.scss']
})
export class FiltersComponent implements OnInit {
    @Output() filteredFields = new EventEmitter<Filter[]>();
    @Output() createdView = new EventEmitter<any>();
    @Input() autoSuggestOptions: string[];
    @Input() filters: Filter[];

    constructor(public dialog: MatDialog) { }

    ngOnInit() {
        this.emitFilters();
    }

    emitFilters = () => {
        this.filteredFields.emit(this.filters);
    }

    deleteFilter = (index) => {
        this.filters.splice(index, 1);
        this.filteredFields.emit(this.filters);
    }

    deleteFilterByColName = (key) => {
        this.filters = this.filters.filter(f => !(f.operator === 'is populated' && f.key === key));
        this.filteredFields.emit(this.filters);
    }

    openDialog = () => {
        const dialogRef = this.dialog.open(FilterDialogComponent, {
            width: '650px',
            data: { autoSuggestOptions: this.autoSuggestOptions }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && result.key && result.operator) {
                this.filters.push(result);
            }
            this.emitFilters();
        });
    }
}
