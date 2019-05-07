import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
    @Output() searchQueryEmitter = new EventEmitter<string>();
    searchQuery: string = null;

    constructor() { }

    ngOnInit() {
        // this.searchQueryEmitter.emit(this.searchQuery);
    }

}
