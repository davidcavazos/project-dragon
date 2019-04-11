import { Component, OnInit, ViewChild, Input, Output, SimpleChanges, ElementRef, EventEmitter } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource, MatSort } from '@angular/material';
import * as XLSX from 'xlsx';

import { TagService } from '../../../../services/api/tag.service';
import { IBlock } from '../../../../models/block';
import { Filter } from '../../../../models/filter';

@Component({
    selector: 'app-table',
    templateUrl: './table.component.html',
    styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {

    displayedColumns: string[] = ['document', 'class'];
    dataSource = new MatTableDataSource<IBlock>([]);
    selection = new SelectionModel<IBlock>(true, []);
    documentMapping: object = {};
    finalRows: Array<any>;
    data: any = [];
    form: FormGroup;

    @Input() sourceList: string[];
    @Input() filteredFields: Filter[];
    @Output() autoSuggestOptions = new EventEmitter<string[]>();
    @Input() appFilter: any;
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild('TABLE') table: ElementRef;

    constructor(private _tag: TagService, private fb: FormBuilder) {
        this.form = this.fb.group({});
    }

    ngOnInit() {
        this.getTagList();
        setInterval(() => {
            this.getValidColumns();
            this.filterTable(this.documentMapping);
        }, 1000)
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.filteredFields && changes.filteredFields.currentValue != changes.filteredFields.previousValue) {
            this.getTagList();
            this.getValidColumns();
        }
    }

    refresh = () => {
        this.displayedColumns = ['document', 'class'];
        this.finalRows = [];
        this.dataSource = new MatTableDataSource<IBlock>([]);
        this.getTagList();
    }

    exportCsv = () => {
        const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.table.nativeElement);//converts a DOM TABLE element to a worksheet
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

        /* save to file */

        XLSX.writeFile(wb, `docex_${new Date().getTime()}.csv`);
    }

    filterTable = (documentMapping) => {
        let rows = Object.values(documentMapping);
        this.finalRows = rows.filter(row => {
            let filterArr = [];
            this.filteredFields.forEach(filter => {
                switch (filter.operator) {
                    case '==':
                        filterArr.push(row[filter.key] == filter.value);
                        break;
                    case '!=':
                        filterArr.push(row[filter.key] != filter.value);
                        break;
                    case '<=':
                        filterArr.push(row[filter.key] <= filter.value);
                        break;
                    case '>=':
                        filterArr.push(row[filter.key] >= filter.value);
                        break;
                    case '<':
                        filterArr.push(row[filter.key] < filter.value);
                        break;
                    case '>':
                        filterArr.push(row[filter.key] > filter.value);
                        break;
                    case 'is populated':
                        filterArr.push(row[filter.key] !== null && row[filter.key] !== undefined);
                        break;
                }
            });
            return !filterArr.includes(false) || filterArr.length == 0;
        });
        this.dataSource = new MatTableDataSource<IBlock>(this.finalRows);
        this.dataSource.sort = this.sort;
    }

    getValidColumns() {
        this.displayedColumns = this.displayedColumns.filter(d => ['document', 'class'].indexOf(d) > -1 || this.filteredFields.some((f) => f.key === d));
        this.data.forEach(item => {
            if (this.displayedColumns.indexOf(item['columnName']) === -1 && this.filteredFields.some((f) => f.key === item['columnName'])) {
                this.displayedColumns.push(item['columnName']);
            }
        });
        let row = (this.finalRows || []).filter((r) => r.enableEdit)[0];
        if (row) {
            this.form = this.fb.group(this.displayedColumns.reduce((val, c) => {
                let initValue = this.form.controls[c] ? this.form.controls[c].value : row[c];
                val[c] = [initValue, Validators.required];
                return val;
            }, {}));
        }
    }

    getTagList = () => {
        this._tag.getTags()
            .subscribe(res => {
                this.data = res['GetTagDocResponse']['data'];
                this.displayedColumns = ['document', 'class'];
                let _displayedColumns = [];
                this.data.forEach(item => {
                    let documentName = item['documentPath'];
                    if (!this.documentMapping.hasOwnProperty(documentName)) {
                        this.documentMapping[documentName] = {
                            'document': item['documentPath']
                        };
                    }
                    this.documentMapping[documentName]['class'] = item['classificationType'];
                    this.documentMapping[documentName][item['columnName']] = item['columnValue'];
                    if (this.displayedColumns.indexOf(item['columnName']) === -1 && this.filteredFields.some((f) => f.key === item['columnName'] && f.operator === 'is populated')) {
                        this.displayedColumns.push(item['columnName']);
                    }
                    if (_displayedColumns.indexOf(item['columnName']) === -1) {
                        _displayedColumns.push(item['columnName']);
                    }
                });
                this.autoSuggestOptions.emit(_displayedColumns);
                this.filterTable(this.documentMapping);
            });
    }

    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource.data.length;
        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle() {
        this.isAllSelected() ? this.selection.clear() : this.dataSource.data.forEach(row => this.selection.select(row));
    }

    removeCol(header) {
        const colName = this.data.filter((r) => r.columnName === header).map((x => x.columnName)).filter((x) => x)[0];
        this.appFilter.deleteFilterByColName(colName);
    }

    enableEdit(row) {
        this.finalRows = this.finalRows.map((r) => {
            r.enableEdit = r.document === row.document;
            return row;
        });
        this.form = this.fb.group(this.displayedColumns.reduce((val, c) => {
            val[c] = [row[c], Validators.required];
            return val;
        }, {}));
    }

    editColValue(row, header) {
        let selectedRecord = this.data.filter((d) => d.documentPath === row.document);
        let input = selectedRecord.map((record) => {
            let _data = {};
            for (const key in record) {
                if (record.hasOwnProperty(key)) {

                    switch (key) {
                        case 'classificationType':
                            _data['classificationType'] = this.form.controls['class'] ? this.form.controls['class'].value : record['classificationType'];
                            break;
                        case 'columnValue':
                            let controlName = record.columnName;
                            _data['columnValue'] = this.form.controls[controlName] ? this.form.controls[controlName].value : record.columnValue;
                            break;
                        default:
                            _data[key] = record[key];
                            break;
                    }
                }
            }
            return _data;
        });

        this._tag.updateTage(input)
            .subscribe((res) => {
                row.enableEdit = false;
                this.refresh();
            });
    }

    addFilter() {
        this.appFilter.openDialog();
    }
}
