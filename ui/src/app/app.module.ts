import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import {
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatInputModule,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    MatCardModule,
    MatTableModule,
    MatCheckboxModule,
    MatSortModule,
    MatDialogModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatRadioModule
} from '@angular/material';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LayoutModule } from '@angular/cdk/layout';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ViewsComponent } from './pages/dashboard/partials/views/views.component';
import { FiltersComponent } from './pages/dashboard/partials/filters/filters.component';
import { SearchComponent } from './pages/dashboard/partials/search/search.component';
import { SourcesComponent } from './pages/dashboard/partials/sources/sources.component';
import { TableComponent } from './pages/dashboard/partials/table/table.component';
import { ClassificationComponent } from './pages/dashboard/partials/classification/classification.component';
import { DialogComponent } from './pages/dashboard/partials/classification/tag-dialog/dialog.component';
import { FilterDialogComponent } from './pages/dashboard/partials/filters/filter-dialog/filter-dialog.component';
import { ViewDialogComponent } from './pages/dashboard/partials/views/view-dialog/view-dialog.component';
import { AddSourceDialogComponent } from './pages/dashboard/partials/sources/add-source-dialog/add-source-dialog.component';
import { TrainDialogComponent } from "./pages/dashboard/partials/sources/train-dialog/train-dialog.component";

import { InterceptorService } from './services/api/interceptor.service';
import { DashboardService } from './services/guard/dashboard.service';
import { LoginService } from './services/guard/login.service';
import { LoaderService } from './services/helper/loader.service';

@NgModule({
    declarations: [
        AppComponent,
        NavbarComponent,
        LoginComponent,
        DashboardComponent,
        ViewsComponent,
        FiltersComponent,
        SearchComponent,
        SourcesComponent,
        TableComponent,
        ClassificationComponent,
        DialogComponent,
        FilterDialogComponent,
        ViewDialogComponent,
        AddSourceDialogComponent,
        TrainDialogComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        LayoutModule,
        HttpClientModule,
        MatToolbarModule,
        MatButtonModule,
        MatSidenavModule,
        MatIconModule,
        MatListModule,
        MatInputModule,
        MatFormFieldModule,
        MatOptionModule,
        MatSelectModule,
        MatCardModule,
        FormsModule,
        ReactiveFormsModule,
        MatTableModule,
        MatCheckboxModule,
        MatSortModule,
        MatDialogModule,
        MatAutocompleteModule,
        MatProgressSpinnerModule,
        MatTooltipModule,
        MatRadioModule
    ],
    providers: [
        DashboardService,
        LoginService,
        LoaderService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: InterceptorService,
            multi: true
        }
    ],
    bootstrap: [AppComponent],
    entryComponents: [DialogComponent, FilterDialogComponent, ViewDialogComponent, AddSourceDialogComponent, TrainDialogComponent]
})
export class AppModule { }
