import { OnChanges, OnInit, OnDestroy, SimpleChange, EventEmitter, AfterViewInit } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { ISlickGridColumn, ISlickGridData } from './interfaces';
import { ISlickEvent } from './selectionmodel';
export declare class SlickGrid implements OnChanges, OnInit, OnDestroy, AfterViewInit {
    private _el;
    columnDefinitions: ISlickGridColumn[];
    dataModel: ISlickGridData;
    resized: Observable<any>;
    highlightedCells: {
        row: number;
        column: number;
    }[];
    blurredColumns: string[];
    contextColumns: string[];
    showHeader: boolean;
    enableColumnReorder: boolean;
    enableAsyncPostRender: boolean;
    selectionModel: string;
    plugins: string[];
    enableEditing: boolean;
    topRowNumber: number;
    activeRowIndexChange: EventEmitter<number>;
    overrideCellFn: (rowNumber, columnId, value?, data?) => string;
    isColumnEditable: (column: number) => boolean;
    isCellEditValid: (row: number, column: number, newValue: any) => boolean;
    loadFinished: EventEmitter<void>;
    editingFinished: EventEmitter<any>;
    contextMenu: EventEmitter<any>;
    topRowNumberChange: EventEmitter<number>;
    cellEditBegin: EventEmitter<{
        row: number;
        column: number;
    }>;
    cellEditExit: EventEmitter<{
        row: number;
        column: number;
        newValue: any;
    }>;
    rowEditBegin: EventEmitter<{
        row: number;
    }>;
    rowEditExit: EventEmitter<{
        row: number;
    }>;
    onFocus(): void;
    private _grid;
    private _columnNameToIndex;
    private _rowHeight;
    private _resizeSubscription;
    private _topRow;
    private _activeEditingRow;
    private _activeEditingRowHasChanges;
    constructor(_el: any);
    ngOnChanges(changes: {
        [propName: string]: SimpleChange;
    }): void;
    ngOnInit(): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    enterEditSession(): void;
    endEditSession(): void;
    readonly onSelectedRowsChanged: ISlickEvent;
    getSelectedRows(): number[];
    getColumnIndex(name: string): number;
    registerPlugin(plugin: string): void;
    subscribeToContextMenu(): void;
    private initGrid();
    private changeEditSession(enabled);
    private handleEditorCellChange(rowNumber);
    private onResize();
    private invalidateRange(start, end);
    private subscribeToScroll();
    private subscribeToCellChanged();
    private subscribeToBeforeEditCell();
    private subscribeToActiveCellChanged();
    private setCallbackOnDataRowsChanged();
    private renderGridDataRowsRange(startIndex, count);
}
