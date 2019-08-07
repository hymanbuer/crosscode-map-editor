import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ElectronService } from './electron.service';
import { FileInfos } from '../models/file-infos';
import { api } from 'cc-map-editor-common';
import { SettingsService } from './settings.service';

@Injectable()
export class CommonService {
    public constructor(
        private readonly http: HttpClient,
        private readonly electron: ElectronService,
        private readonly settings: SettingsService,
        ) {
    }


    public getAllFiles(): Observable<FileInfos> {
        return this.commonOrApi(api.getAllFiles, 'api/allFiles');
    }

    public getAllTilesets(): Observable<string[]> {
        return this.commonOrApi(api.getAllTilesets, 'api/allTilesets');
    }

    public getMaps(): Observable<string[]> {
        return this.commonOrApi(api.getAllMaps, 'api/allMaps');
    }


    private commonOrApi<T>(api: (path: string) => Promise<T>, url: string): Observable<T> {
        if (!this.settings.isElectron) {
            return this.http.get<T>(this.settings.URL + url);
        }
        const path = this.electron.getAssetsPath();
        return this.toObservable(api(path));
    }

    private toObservable<T>(promise: Promise<T>): Observable<T> {
        return new Observable<T>(subsriber => {
            promise
                .then(value => subsriber.next(value))
                .catch(err => subsriber.error(err))
                .finally(() => subsriber.complete());
        });
    }
}
