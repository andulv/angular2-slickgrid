/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Observable, Subject } from 'rxjs/Rx';

export enum NotificationType {
    Error,
    UpdateAvailable,
    UpdateDownloaded
}

export interface ISelectionRange {
    startRow: number;
    endRow: number;
    startColumn: number;
    endColumn: number;
}

// export enum CollectionChange {
//     ItemsReplaced
// }

// export interface IObservableCollection<T> {
//     getLength(): number;
//     at(index: number): T;
//     getRange(start: number, end: number): T[];
//     setCollectionChangedCallback(callback: (change: CollectionChange, startIndex: number, count: number) => void): void;
// }

export class CancellationToken {
    private _isCanceled: boolean = false;
    private _canceled: Subject<any> = new Subject<any>();

    cancel(): void {
        this._isCanceled = true;
        this._canceled.next(undefined);
    }

    get isCanceled(): boolean {
        return this._isCanceled;
    }

    get canceled(): Observable<any> {
        return this._canceled;
    }
}

export interface ISlickGridData {
    // https://github.com/mleibman/SlickGrid/wiki/DataView
    getLength(): number;
    getItem(index: number): any;
    getRange(start: number, end: number): any; // only available in the forked SlickGrid
    getItemMetadata(index: number): any;
}

export interface ISlickGridColumn {
    // https://github.com/mleibman/SlickGrid/wiki/Column-Options
    name: string;
    field: string;
    id: string;
    icon: string;
    resizable: boolean;
    minWidth?: number;
    width?: number;
    asyncPostRender?: (cellRef: string, row: number, dataContext: JSON, colDef: any) => void;
    formatter?: (row: number, cell: any, value: any, columnDef: any, dataContext: any) => string;
}

// export enum FieldType {
//     String = 0,
//     Boolean = 1,
//     Integer = 2,
//     Decimal = 3,
//     Date = 4,
//     Unknown = 5
// }

// export interface IColumnDefinition {
//     id?: string;
//     name: string;
//     type: FieldType;
//     asyncPostRender?: (cellRef: string, row: number, dataContext: JSON, colDef: any) => void;
//     formatter?: (row: number, cell: any, value: any, columnDef: any, dataContext: any) => string;
//     isEditable?: boolean;
// }

// export interface IGridColumnDefinition {
//     id: string;
//     type: number;
// }

// export interface IGridDataRow {
//     row?: number;
//     values: any[];
// }
