import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class VisionService {

    visionUrl: string = `${environment.baseUrl}/vision/predict`;
    trainUrl: string = `${environment.baseUrl}/vision/train`;

    constructor(private _http: HttpClient) { }


    predictDocument(documentArray) {
        let payload = {
            PredictRequest: {
                Sources: documentArray
            }
        };
        return this._http.post(this.visionUrl, payload);
    }

    trainModel(input) {
        let payload = {
            TrainModelRequest: input
        };
        return this._http.post(this.trainUrl, payload);
    }
}
