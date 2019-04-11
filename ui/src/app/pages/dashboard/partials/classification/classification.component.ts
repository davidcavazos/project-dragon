import { Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog, MatDialogConfig } from "@angular/material";
import { DialogComponent } from "./tag-dialog/dialog.component";

import { ImageService } from '../../../../services/api/image.service';
import { TagService } from '../../../../services/api/tag.service';
import { Image } from '../../../../models/image';

@Component({
    selector: 'app-classification',
    templateUrl: './classification.component.html',
    styleUrls: ['./classification.component.scss']
})
export class ClassificationComponent implements OnInit {
    @Input() classificationData: object;
    @Input() autoSuggestOptions: string[];
    @Output() saveClassificationTagsFlag = new EventEmitter<boolean>();

    constructor(private dialog: MatDialog, private _tage: TagService, private _image: ImageService, private _sanitizer: DomSanitizer) { }

    @ViewChild('displayedImage') displayedImage: ElementRef;
    @ViewChild('drawingCanvas') drawingCanvas: ElementRef;

    currentItem: object;
    counter: number = 0;
    imgSrc: any = '';
    bounds: any = [];
    taggedData: any = [];

    imageDimentions: Image = {
        width: 100,
        height: 100
    };

    btndisabled = false;

    ngOnInit() {
        this.currentItem = this.classificationData['PredictionResult'][this.counter];
    }

    ngAfterViewInit() {
        this.taggedData = [];
        this.initiateForDoc();
    }

    initiateForDoc = () => {

        this._image.getImage(this.currentItem['source'])
            .subscribe(result => {
                this.bounds = this.getDocumentBounds(this.currentItem['visionAPIResponse'], 'fullTextAnnotation1', ['word']);

                this._tage.search({
                    classificationType: this.currentItem['autoMLAPIResponse'].payload[0].displayName,
                    bounds: this.bounds
                }).subscribe((res) => {
                    let _res = res as any;
                    this.bounds = _res.SearchTagResponse;
                    this.imgSrc = this._sanitizer.bypassSecurityTrustResourceUrl(result['GetImageResponse']);
                    this.visualizeImages(this.bounds);
                });
            });
    }

    nextItem = () => {
        this.counter++;
        this.currentItem = this.classificationData['PredictionResult'][this.counter];
        this.initiateForDoc();
    }

    prevItem = () => {
        this.counter--;
        this.currentItem = this.classificationData['PredictionResult'][this.counter];
        this.initiateForDoc();
    }

    onImageClick = (event) => {
        const canvas = this.drawingCanvas.nativeElement;
        const x = event.pageX - canvas.getBoundingClientRect().left;
        const y = event.pageY - canvas.getBoundingClientRect().top;
        this.bounds.forEach((bound) => {
            if (y > bound.y && y < bound.y + bound.height && x > bound.x && x < bound.x + bound.width) {
                this.openDialog(bound, x, y);
            }
        });
    }

    saveClassificatioData = () => {
        this._tage.createTags(this.taggedData)
            .subscribe((result) => {
                this.saveClassificationTagsFlag.emit(false);
            })
    }

    cancel = () => {
        this.saveClassificationTagsFlag.emit(false);
    }

    private openDialog(bound, x, y) {

        const data = this.classificationData['PredictionResult'][this.counter];
        const dialogConfig = new MatDialogConfig();

        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;

        dialogConfig.data = {
            documentPath: data.source.path,
            classificationType: data.autoMLAPIResponse.payload[0].displayName,
            classificationScore: data.autoMLAPIResponse.payload[0].classification.score.toString(),
            columnName: bound.columnName || '',
            columnValue: (bound.description || '').replace(',', '').replace('$', ''),
            vertices: '',
            autoSuggestOptions: this.autoSuggestOptions
        };
        const dialogRef = this.dialog.open(DialogComponent, dialogConfig);

        dialogRef.afterClosed().subscribe(val => {
            if (val) {
                let selectData = Object.assign({}, dialogConfig.data, val, {
                    yCoordinate: bound.y, height: bound.height, xCoordinate: bound.x, width: bound.width
                });

                if (!this.taggedData.some((t) => this.isEquivalent(t, selectData))) {
                    this.taggedData.push(selectData);
                }
            }
        });
    }

    private visualizeImages = (bounds) => {
        const canvas = this.drawingCanvas.nativeElement;
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

        if (canvas.getContext) {
            bounds.forEach((bound) => {
                this.drawBox(canvas, bound);
            });
        }
    }

    private drawBox = (canvas, bounds) => {
        const { x, y, width, height, color } = bounds;
        const _rectangle = new Path2D();
        const _context = canvas.getContext('2d');

        _rectangle.rect(x, y, width, height);
        _context.strokeStyle = color || 'black';
        _context.stroke(_rectangle);
    }

    private getBoxDimentions = (vertices, color, description) => {
        const { x, y } = vertices[0];
        const width = vertices[2].x - vertices[0].x;
        const height = vertices[2].y - vertices[0].y;
        return { x, y, width, height, color, description };
    }

    private getDocumentBounds = (response, type = "textAnnotation", feature = []) => {
        const _bounds = [];
        const _feature = feature.map((f) => f.toUpperCase());

        if (type.toLowerCase() === 'fulltextannotation') {
            response.fullTextAnnotation.pages.forEach((page) => {
                page.blocks.forEach((block) => {
                    if (_feature.indexOf('BLOCK') > -1) {
                        _bounds.push(this.getBoxDimentions(block.boundingBox.vertices, 'aqua', null));
                    }
                    block.paragraphs.forEach((paragraph) => {
                        if (_feature.indexOf('PARA') > -1) {
                            _bounds.push(this.getBoxDimentions(paragraph.boundingBox.vertices, 'darkcyan', null));
                        }
                        paragraph.words.forEach((word) => {
                            if (_feature.indexOf('WORD') > -1) {
                                _bounds.push(this.getBoxDimentions(word.boundingBox.vertices, 'limegreen', null));
                            }
                            word.symbols.forEach((symbol) => {
                                if (_feature.indexOf("SYMBOL") > -1) {
                                    _bounds.push(this.getBoxDimentions(symbol.boundingBox.vertices, 'magenta', null));
                                }
                            })
                        })
                    })
                })
            });
        } else {
            response.textAnnotations.shift();
            response.textAnnotations.forEach((block) => {
                _bounds.push(this.getBoxDimentions(block.boundingPoly.vertices, 'limegreen', block.description));
            })
        }
        return _bounds;
    }

    private isEquivalent = (a, b) => {
        const aProps = Object.getOwnPropertyNames(a);
        const bProps = Object.getOwnPropertyNames(b);

        if (aProps.length != bProps.length) {
            return false;
        }

        for (var i = 0; i < aProps.length; i++) {
            var propName = aProps[i];

            if (a[propName] !== b[propName]) {
                return false;
            }
        }

        return true;
    }

}
