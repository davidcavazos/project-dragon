import { Component, OnInit } from '@angular/core';

import { SourceService } from '../../services/api/source.service';
import { VisionService } from '../../services/api/vision.service';
import { LoaderService } from '../../services/helper/loader.service';
import { Filter } from '../../models/filter';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    private _rawSourceList: any[];
    sourceList: string[];
    isClassificationResultReady: boolean = false;
    classificationData: object;

    filteredFields: Filter[] = [];
    createdView: object = {};
    filters: Filter[] = [];
    autoSuggestOptions: string[] = [];

    constructor(private _source: SourceService, private _vision: VisionService, public loaderService: LoaderService) { }

    ngOnInit() {
        this.getSourceList();
    }

    setFilters = (e) => {
        this.filters = e;
        this.filteredFields = e;
    }

    getSourceList = () => {
        this._source.getSources().subscribe(res => {
            this._rawSourceList = res['GetSourcesResponse']['data'];
            this.sourceList = res['GetSourcesResponse']['data'].map(item => item['path']);
        });
    }

    verifyAndAddSource = (newSource) => {

        this._source.addSource(newSource)
            .subscribe((res) => {
                this.getSourceList();
            })
    }

    deleteSource = (input) => {
        let selectedSource = this._rawSourceList.filter((s) => s.path === input)[0];
        this._source.deleteSource(selectedSource.id)
            .subscribe((res) => {
                this.getSourceList();
            })

    }

    predictDocument = (sources) => {
        this.isClassificationResultReady = false;
        this._vision.predictDocument(sources).subscribe(res => {
            let response = res as any;
            if (response && response.PredictionResult && response.PredictionResult.length > 0) {
                this.isClassificationResultReady = true;
                this.classificationData = response;
            } else {
                alert('No result from prediction.')
            }

        })
    }
}
