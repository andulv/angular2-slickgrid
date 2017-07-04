"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const Rx_1 = require("rxjs/Rx");
var NotificationType;
(function (NotificationType) {
    NotificationType[NotificationType["Error"] = 0] = "Error";
    NotificationType[NotificationType["UpdateAvailable"] = 1] = "UpdateAvailable";
    NotificationType[NotificationType["UpdateDownloaded"] = 2] = "UpdateDownloaded";
})(NotificationType = exports.NotificationType || (exports.NotificationType = {}));
// export enum CollectionChange {
//     ItemsReplaced
// }
// export interface IObservableCollection<T> {
//     getLength(): number;
//     at(index: number): T;
//     getRange(start: number, end: number): T[];
//     setCollectionChangedCallback(callback: (change: CollectionChange, startIndex: number, count: number) => void): void;
// }
class CancellationToken {
    constructor() {
        this._isCanceled = false;
        this._canceled = new Rx_1.Subject();
    }
    cancel() {
        this._isCanceled = true;
        this._canceled.next(undefined);
    }
    get isCanceled() {
        return this._isCanceled;
    }
    get canceled() {
        return this._canceled;
    }
}
exports.CancellationToken = CancellationToken;
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
