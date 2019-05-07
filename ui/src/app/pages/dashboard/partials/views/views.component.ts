import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Filter } from '../../../../models/filter';
import { ViewService } from '../../../../services/api/view.service';
import { ViewDialogComponent } from './view-dialog/view-dialog.component';
import { MatDialog } from '@angular/material';

export interface View {
    name: string,
    filters: Filter[]
}

@Component({
    selector: 'app-views',
    templateUrl: './views.component.html',
    styleUrls: ['./views.component.scss']
})
export class ViewsComponent implements OnInit {
    @Input() createdView;
    @Input() currentFilters;
    @Output() selectedView = new EventEmitter<Filter[]>();
    selectedViewIndex: number;
    views: View[] = []
    constructor(private _view: ViewService, public dialog: MatDialog) { }

    ngOnInit() {
        this._view.getViews().subscribe(res => {
            this.views = res['GetViewResponse'].map((view) => {
                return {
                    name: view['name'],
                    filters: view['fitlers'].map((filter) => {
                        return {
                            id: filter['id'],
                            key: filter['key'],
                            value: filter['value'],
                            operator: filter['operator']
                        }
                    })
                }
            });
        })
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.createdView && changes.createdView.currentValue != changes.createdView.previousValue && changes.createdView.currentValue.hasOwnProperty('name')) {
            this.views.push(changes.createdView.currentValue);
        }
    }

    selectView = (i) => {
        this.selectedViewIndex = i;
        this.selectedView.emit(this.views[i].filters);
    }

    deleteView = (index) => {
        let selectedViewId = this.views[index].filters.map((f) => f.id);
        this._view.deleteView(selectedViewId)
            .subscribe((res) => {
                this.ngOnInit();
            });
    }

    saveAsView = () => {

        const dialogRef = this.dialog.open(ViewDialogComponent, {
            width: '300px'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                let view = this.currentFilters.map((filter) => {
                    return { viewname: result, ...filter };
                });

                this._view.createViews(view)
                    .subscribe(res => {
                        this.selectedViewIndex = undefined;
                        this._view.getViews().subscribe(res => {
                            this.views = res['GetViewResponse'].map((view, i) => {
                                this.selectedViewIndex = view['name'] === result ? i : this.selectedViewIndex;
                                return {
                                    name: view['name'],
                                    filters: view['fitlers'].map((filter) => {
                                        return {
                                            id: filter['id'],
                                            key: filter['key'],
                                            value: filter['value'],
                                            operator: filter['operator']
                                        }
                                    })
                                }
                            });
                        });
                    });
            }
        });
    }
}
