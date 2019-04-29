import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {MapLoaderService} from '../../shared/map-loader.service';
import {MatDialog} from '@angular/material';
import {MapSettingsComponent} from '../dialogs/map-settings/map-settings.component';
import {CCMap} from '../../shared/phaser/tilemap/cc-map';
import {GlobalEventsService} from '../../shared/global-events.service';
import {OffsetMapComponent} from '../dialogs/offset-map/offset-map.component';
import {environment} from '../../../environments/environment';
import {OverlayService} from '../../shared/overlay/overlay.service';
import {NpcStatesComponent} from '../../shared/widgets/npc-states-widget/npc-states/npc-states.component';
import {Overlay} from '@angular/cdk/overlay';
import {SettingsComponent} from '../dialogs/settings/settings.component';
import {Globals} from '../../shared/globals';

@Component({
	selector: 'app-toolbar',
	templateUrl: './toolbar.component.html',
	styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {
	
	isElectron = Globals.isElectron;
	map: CCMap;
	loaded: boolean;
	error: string;
	version = environment.version;
	
	constructor(private mapLoader: MapLoaderService,
	            private events: GlobalEventsService,
	            private dialog: MatDialog,
	            private overlayService: OverlayService,
	            private overlay: Overlay) {
	}
	
	ngOnInit() {
		this.mapLoader.tileMap.subscribe(map => {
			this.map = map;
		});
		this.events.loadComplete.subscribe(
			() => this.loaded = true,
			err => this.error = 'Error: could not load CrossCode assets. Update path in edit/settings'
		);
	}
	
	loadMap(event) {
		this.mapLoader.loadMap(event);
	}
	
	saveMap() {
		const file = new Blob([JSON.stringify(this.map.exportMap(), null, 2)], {type: 'application/json'});
		const a = document.createElement('a'),
			url = URL.createObjectURL(file);
		a.href = url;
		a.download = this.map.filename;
		document.body.appendChild(a);
		a.click();
		setTimeout(function () {
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);
		}, 0);
	}
	
	openMapSettings() {
		this.dialog.open(MapSettingsComponent, {
			data: this.map
		});
	}
	
	generateHeights() {
		this.events.generateHeights.next();
	}
	
	offsetMap() {
		this.dialog.open(OffsetMapComponent, {
			data: this.map
		});
	}
	
	showSettings() {
		this.overlayService.open(SettingsComponent, {
			positionStrategy: this.overlay.position().global()
				.left('23vw')
				.top('calc(64px + 6vh / 2)'),
			hasBackdrop: true
		});
	}
}
