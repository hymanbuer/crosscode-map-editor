import {
	Component,
	OnInit,
	Input,
	ChangeDetectionStrategy, OnChanges
} from '@angular/core';
import { AbstractEvent, EventType, EventTypeChild } from '../../event-registry/abstract-event';
import { EventHelperService } from '../event-helper.service';
import { NestedTreeControl, FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource, MatTreeFlattener, MatTreeFlatDataSource } from '@angular/material';

interface EventDisplay {
	text: string;
	hideIcon: boolean;
	isActionStep: boolean;
	data?: AbstractEvent<any>;
	children?: AbstractEvent<any>[];

	level: number;
}

@Component({
	selector: 'app-event-editor',
	templateUrl: './event-editor.component.html',
	styleUrls: ['./event-editor.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventEditorComponent implements OnChanges {
	@Input() eventData: EventType[] = [];
	@Input() actionStep = false;

	workingData?: AbstractEvent<any>[];

	treeControl = new FlatTreeControl<EventDisplay>(e => e.level, e => e.children != null && e.children.length > 0);
	treeFlattener = new MatTreeFlattener(
		(node: EventDisplay, level: number) => this.setLevel(node, level), 
		e => e.level, 
		e => e.children != null && e.children.length > 0, 
		e => this.convertNodes(e.children!));
	dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

	constructor(private helper: EventHelperService) {
		helper.selectedEvent.subscribe(v => {
			if (v) {
				// TODO: remove event?
				// console.log(v.text);
			}
		});
	}

	show() {
		console.log(this.workingData);
	}

	ngOnChanges() {
		let cpy = JSON.parse(JSON.stringify(this.eventData));
		if (!cpy.map) {
			// TODO: find out how to properly handle quests
			cpy = cpy.quest;
		}
		if (cpy.map) {
			this.workingData = cpy.map((val: EventType) => this.helper.getEventFromType(val, this.actionStep));
		} else {
			this.workingData = [];
		}
		this.dataSource.data = this.convertNodes(this.workingData!);
		this.treeControl.expandAll();
	}

	refresh() {
		this.dataSource.data = this.convertNodes(this.workingData!);
		this.treeControl.expandAll();
	}

	export() {
		if (this.workingData) {
			return this.workingData.map(event => event.export());
		} else {
			return this.eventData;
		}
	}

	getParent(node: EventDisplay): AbstractEvent<any>[] | null {
		const currentLevel = this.treeControl.getLevel(node);
		if (currentLevel <= 0) {
			return null;
		}

		const currentIndex = this.treeControl.dataNodes.indexOf(node);
		for (let i = currentIndex - 1; i >= 0; i--) {
			const node = this.treeControl.dataNodes[i];

			if (this.treeControl.getLevel(node) < currentLevel) {
				return node.children as AbstractEvent<any>[];
			}
		}
		
		return null;
	}

	private setLevel(node: EventDisplay, level: number): EventDisplay {
		node.level = level;
		return node;
	}

	private convertNodes(nodes: AbstractEvent<any>[]): EventDisplay[] {
		const result: EventDisplay[] = [];
		for (const node of nodes) {
			const entry: EventDisplay = {
				text: node.info,
				hideIcon: false,
				isActionStep: true,
				data: node,
				level: 0,
			};

			if (node.children 
				&& node.children.length > 0
				&& node.children[0].title == null) {
					entry.children = node.children[0].events;
				}

			result.push(entry);

			if (node.children == null) {
				continue;
			}

			for (const child of node.children) {
				if (!child.title) {
					continue;
				}

				result.push({
					text: child.title,
					hideIcon: child.hideGreaterSign || false,
					isActionStep: false,
					level: 0,
					children: child.events,
				});
			}
		}

		result.push({
			text: ' ',
			hideIcon: false,
			isActionStep: false,
			level: 0
		})

		return result;
	}
}
