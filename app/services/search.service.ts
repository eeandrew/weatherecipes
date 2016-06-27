import {Injectable} from '@angular/core';
import {Couchbase} from 'nativescript-couchbase';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import config = require('../config');
let api = config.SERVER_API;
@Injectable()
export class SearchService {
    db;
    rows: Array<any>;
    hasData: boolean;
    locations;
    constructor(private http: Http) {
        this.db = new Couchbase("weatherecipes");
        this.db.createView("locations", "1", function (document, emitter) {
            emitter.emit(document._id, document);
        });
        this.rows = this.db.executeQuery("locations");
    }
    addLocation(loc) {
        return Observable.forkJoin(
            this.http.get(`${api}/api/location/reverse?latitude=${loc.lat}&longitude=${loc.lon}`).map((res: Response) => res.json()),
            this.http.get(`${api}/api/weather/forecast?latitude=${loc.lat}&longitude=${loc.lon}`).map((res: Response) => res.json()),
            this.http.get(`${api}/api/images/location/500px?latitude=${loc.lat}&longitude=${loc.lon}`).map((res: Response) => res.json())
        )
    }
    search(query: string): Observable<any> {
        return this.http.get(`${api}/api/location/search?address=${encodeURI(query)}`).map((res: Response) => res.json())
    }
}