"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular/core");
const Rx_1 = require("rxjs/Rx");
const selectionmodel_1 = require("./selectionmodel");
let SlickGrid = class SlickGrid {
    ////////// Constructor and Angular functions //////////////////////////////
    constructor(_el) {
        this._el = _el;
        this.highlightedCells = [];
        this.blurredColumns = [];
        this.contextColumns = [];
        this.showHeader = true;
        this.enableColumnReorder = false;
        this.enableAsyncPostRender = false;
        this.selectionModel = '';
        this.plugins = [];
        this.enableEditing = false;
        this.activeRowIndexChange = new core_1.EventEmitter();
        this.loadFinished = new core_1.EventEmitter();
        this.editingFinished = new core_1.EventEmitter();
        this.contextMenu = new core_1.EventEmitter();
        this.topRowNumberChange = new core_1.EventEmitter();
        this.cellEditBegin = new core_1.EventEmitter();
        this.cellEditExit = new core_1.EventEmitter();
        this.rowEditBegin = new core_1.EventEmitter();
        this.rowEditExit = new core_1.EventEmitter();
        this._rowHeight = 29;
        this._topRow = 0;
    }
    onFocus() {
        if (this._grid) {
            this._grid.focus();
        }
    }
    ngOnChanges(changes) {
        let columnDefinitionChanges = changes['columnDefinitions'];
        let activeCell = this._grid ? this._grid.getActiveCell() : undefined;
        let hasGridStructureChanges = false;
        let wasEditing = this._grid ? !!this._grid.getCellEditor() : false;
        if (columnDefinitionChanges
            && !_.isEqual(columnDefinitionChanges.previousValue, columnDefinitionChanges.currentValue)) {
            if (!this._grid) {
                this.initGrid();
            }
            else {
                this._grid.resetActiveCell();
                this._grid.setColumns(this.columnDefinitions);
            }
            hasGridStructureChanges = true;
            if (!columnDefinitionChanges.currentValue || columnDefinitionChanges.currentValue.length === 0) {
                activeCell = undefined;
            }
            if (activeCell) {
                let columnThatContainedActiveCell = columnDefinitionChanges.previousValue[Math.max(activeCell.cell - 1, 0)];
                let newActiveColumnIndex = columnThatContainedActiveCell
                    ? columnDefinitionChanges.currentValue.findIndex(c => c.id === columnThatContainedActiveCell.id)
                    : -1;
                activeCell.cell = newActiveColumnIndex !== -1 ? newActiveColumnIndex + 1 : 0;
            }
        }
        if (changes['dataModel']) {
            this.setCallbackOnDataRowsChanged();
            this._grid.updateRowCount();
            this._grid.setColumns(this._grid.getColumns());
            this._grid.invalidateAllRows();
            this._grid.render();
            hasGridStructureChanges = true;
        }
        if (hasGridStructureChanges) {
            if (activeCell) {
                this._grid.setActiveCell(activeCell.row, activeCell.cell);
            }
            else {
                this._grid.resetActiveCell();
            }
        }
        if (wasEditing && hasGridStructureChanges) {
            this._grid.editActiveCell();
        }
    }
    ngOnInit() {
        // ngOnInit() will be called *after* the first time ngOnChanges() is called
        // so, grid must be there already
        if (this.topRowNumber === undefined) {
            this.topRowNumber = 0;
        }
        this._grid.scrollRowToTop(this.topRowNumber);
        if (this.resized) {
            // Re-rendering the grid is expensive. Throttle so we only do so every 100ms.
            this.resized.throttleTime(100)
                .subscribe(() => this.onResize());
        }
        // subscribe to slick events
        // https://github.com/mleibman/SlickGrid/wiki/Grid-Events
        this.subscribeToScroll();
        this.subscribeToCellChanged();
        this.subscribeToBeforeEditCell();
        this.subscribeToContextMenu();
        this.subscribeToActiveCellChanged();
        this._activeEditingRowHasChanges = false;
    }
    ngAfterViewInit() {
        this.loadFinished.emit();
    }
    ngOnDestroy() {
        if (this._resizeSubscription !== undefined) {
            this._resizeSubscription.unsubscribe();
        }
    }
    ////////// Public functions  - Add public API functions here //////////////
    // Enables editing on the grid
    enterEditSession() {
        this.changeEditSession(true);
    }
    // Disables editing on the grid
    endEditSession() {
        this.changeEditSession(false);
    }
    // Called whenever the grid's selected rows change 
    // Event args: { rows: number[] }
    get onSelectedRowsChanged() {
        return this._grid.onSelectedRowsChanged;
    }
    // Returns an array of row indices corresponding to the currently selected rows.
    getSelectedRows() {
        return this._grid.getSelectedRows();
    }
    // Gets the column index of the column with the given name
    getColumnIndex(name) {
        return this._columnNameToIndex[name];
    }
    // // Gets a ISlickRange corresponding to the current selection on the grid
    // public getSelectedRanges(): ISlickRange[] {
    //     if (this._gridSyncService && this._gridSyncService.selectionModel) {
    //         return this._gridSyncService.selectionModel.getSelectedRanges();
    //     }
    // }
    // Registers a Slick plugin with the given name
    registerPlugin(plugin) {
        if (Slick[plugin] && typeof Slick[plugin] === 'function') {
            this._grid.registerPlugin(new Slick[plugin]);
        }
        else {
            console.error(`Tried to register plugin ${plugin}, but none was found to be attached to Slick Grid or it was not a function.
                        Please extend the Slick with the plugin as a function before registering`);
        }
    }
    // // Set this grid to be the active grid
    // public setActive(): void {
    //     this._grid.setActiveCell(0, 1);
    //     if (this._gridSyncService && this._gridSyncService.selectionModel) {
    //         this._gridSyncService.selectionModel.setSelectedRanges([new Slick.Range(0, 0, 0, 0)]);
    //     }
    // }
    // // Set the grid's selection
    // public set selection(range: ISlickRange[] | boolean) {
    //     if (typeof range === 'boolean') {
    //         if (range) {
    //             this._gridSyncService.selectionModel.setSelectedRanges(
    //                 [new Slick.Range(0, 0, this._grid.getDataLength() - 1, this._grid.getColumns().length - 1)]
    //             );
    //         } else {
    //             this._gridSyncService.selectionModel.clearSelection();
    //         }
    //     } else {
    //         this._gridSyncService.selectionModel.setSelectedRanges(range);
    //     }
    // }
    // Add a context menu to SlickGrid
    subscribeToContextMenu() {
        const self = this;
        this._grid.onContextMenu.subscribe(function (event) {
            event.preventDefault();
            self.contextMenu.emit(event);
        });
    }
    ////////// Private functions //////////////////////////////////////////////
    initGrid() {
        // https://github.com/mleibman/SlickGrid/wiki/Grid-Options
        let options = {
            enableCellNavigation: true,
            enableColumnReorder: this.enableColumnReorder,
            forceFitColumns: true,
            renderRowWithRange: true,
            showRowNumber: false,
            showDataTypeIcon: false,
            showHeader: this.showHeader,
            rowHeight: this._rowHeight,
            defaultColumnWidth: 120,
            multiColumnSort: true,
            editable: this.enableEditing,
            autoEdit: this.enableEditing,
            enableAddRow: false,
            enableAsyncPostRender: this.enableAsyncPostRender
        };
        this._grid = new Slick.Grid(this._el.nativeElement.getElementsByClassName('grid')[0], this.dataModel, this.columnDefinitions, options);
        this._grid.onSort.subscribe((e, args) => {
            this.dataModel.sortData(args.sortCols);
            this._grid.invalidate();
            this._grid.render();
        });
        if (this.selectionModel) {
            if (Slick[this.selectionModel] && typeof Slick[this.selectionModel] === 'function') {
                let innerModel = new Slick[this.selectionModel]();
                let outerModel = new selectionmodel_1.SelectionModel(innerModel, new Slick.EventHandler(), new Slick.Event(), (fromRow, fromCell, toRow, toCell) => new Slick.Range(fromRow, fromCell, toRow, toCell));
                console.log('Setting selectionModel...' + outerModel);
                this._grid.setSelectionModel(outerModel);
            }
            else {
                console.error(`Tried to register selection model ${this.selectionModel}, 
                                but none was found to be attached to Slick Grid or it was not a function.
                                Please extend the Slick with the selection model as a function before registering`);
            }
        }
        // if (this._gridSyncService) {
        //     console.log('initGrid() _gridSyncService is defined.');
        //     if (this.selectionModel) {
        //         console.log('Setting selectionModel...' + this.selectionModel);
        //         if (Slick[this.selectionModel] && typeof Slick[this.selectionModel] === 'function') {
        //             this._gridSyncService.underlyingSelectionModel = new Slick[this.selectionModel]();
        //         } else {
        //             console.error(`Tried to register selection model ${this.selectionModel}, 
        //                            but none was found to be attached to Slick Grid or it was not a function.
        //                            Please extend the Slick with the selection model as a function before registering`);
        //         }
        //     }
        //     this._gridSyncService.scrollBarWidthPX = this._grid.getScrollbarDimensions().width;
        //     this._gridSyncSubscription = this._gridSyncService.updated
        //         .filter(p => p === 'columnWidthPXs')
        //         .debounceTime(10)
        //         .subscribe(p => {
        //             this.updateColumnWidths();
        //         });
        // }
        for (let plugin of this.plugins) {
            this.registerPlugin(plugin);
        }
        this._columnNameToIndex = {};
        for (let i = 0; i < this.columnDefinitions.length; i++) {
            this._columnNameToIndex[this.columnDefinitions[i].name] = i;
        }
        this.onResize();
    }
    changeEditSession(enabled) {
        this.enableEditing = enabled;
        let options = this._grid.getOptions();
        options.editable = enabled;
        options.enableAddRow = false; // TODO change to " options.enableAddRow = false;" when we support enableAddRow
        this._grid.setOptions(options);
    }
    handleEditorCellChange(rowNumber) {
        // Need explicit undefined check due to row 0
        let firstTimeEditingRow = this._activeEditingRow === undefined;
        let editingNewRow = rowNumber !== this._activeEditingRow;
        // Check if we have existing edits on a row and we are leaving that row
        if (!firstTimeEditingRow && editingNewRow && this._activeEditingRowHasChanges) {
            this._activeEditingRowHasChanges = false;
            this.rowEditExit.emit({
                row: this._activeEditingRow
            });
            this._activeEditingRow = undefined;
        }
        // Check if we are entering a new row
        if (firstTimeEditingRow || editingNewRow) {
            this._activeEditingRow = rowNumber;
            this.rowEditBegin.emit({
                row: rowNumber
            });
        }
    }
    onResize() {
        if (this._grid !== undefined) {
            // this will make sure the grid header and body to be re-rendered
            this._grid.resizeCanvas();
        }
    }
    invalidateRange(start, end) {
        let refreshedRows = _.range(start, end);
        this._grid.invalidateRows(refreshedRows, true);
        this._grid.render();
    }
    subscribeToScroll() {
        this._grid.onScroll.subscribe((e, args) => {
            let scrollTop = args.scrollTop;
            let scrollRow = Math.floor(scrollTop / this._rowHeight);
            scrollRow = scrollRow < 0 ? 0 : scrollRow;
            if (scrollRow !== this._topRow) {
                this._topRow = scrollRow;
                this.topRowNumberChange.emit(scrollRow);
            }
        });
    }
    subscribeToCellChanged() {
        this._grid.onCellChange.subscribe((e, args) => {
            let modifiedColumn = this.columnDefinitions[args.cell - 1];
            this._activeEditingRowHasChanges = true;
            this.cellEditExit.emit({
                column: this.getColumnIndex(modifiedColumn.name),
                row: args.row,
                newValue: args.item[modifiedColumn.id]
            });
        });
    }
    subscribeToBeforeEditCell() {
        this._grid.onBeforeEditCell.subscribe((e, args) => {
            this.handleEditorCellChange(args.row);
            this.cellEditBegin.emit({
                column: this.getColumnIndex(args.column.name),
                row: args.row
            });
        });
    }
    subscribeToActiveCellChanged() {
        // Subscribe to all active cell changes to be able to catch when we tab to the header on the next row
        this._grid.onActiveCellChanged.subscribe((e, args) => {
            this.activeRowIndexChange.emit(args.row);
            // If editing is disabled or this isn't the header, ignore. 
            // We assume the header is always column 0, as it is hardcoded to be that way in initGrid
            if (!this.enableEditing || args.cell !== 0) {
                return;
            }
            let rowNumber = args.row;
            let haveRowEdits = this._activeEditingRow !== undefined;
            let tabbedToNextRow = rowNumber !== this._activeEditingRow; // Need explicit undefined check due to row 0
            // If we tabbed from an edited row to the header of the next row, emit a rowEditExit
            if (haveRowEdits && tabbedToNextRow && this._activeEditingRowHasChanges) {
                this.rowEditExit.emit();
                this._activeEditingRow = undefined;
                this._activeEditingRowHasChanges = false;
            }
        });
    }
    // private updateColumnWidths(): void {
    //     for (let i = 0; i < this.columnDefinitions.length; i++) {
    //         this.columnDefinitions[i].width = this._gridSyncService.columnWidthPXs[i];
    //     }
    //     this._grid.setColumnWidths(this.columnDefinitions, true);
    // }
    setCallbackOnDataRowsChanged() {
        // if (this.dataRows) {
        //     // We must wait until we get the first set of dataRows before we enable editing or slickgrid will complain
        //     if (this.enableEditing) {
        //         this.enterEditSession();
        //     }
        //     this.dataRows.setCollectionChangedCallback((change: CollectionChange, startIndex: number, count: number) => {
        //         this.renderGridDataRowsRange(startIndex, count);
        //     });
        // }
        if (this.renderGridDataRowsRange === undefined) {
            this.renderGridDataRowsRange(0, 0);
        }
    }
    renderGridDataRowsRange(startIndex, count) {
        let editor = this._grid.getCellEditor();
        let oldValue = editor ? editor.getValue() : undefined;
        let wasValueChanged = editor ? editor.isValueChanged() : false;
        this.invalidateRange(startIndex, startIndex + count);
        let activeCell = this._grid.getActiveCell();
        if (editor && activeCell.row >= startIndex && activeCell.row < startIndex + count) {
            if (oldValue && wasValueChanged) {
                editor.setValue(oldValue);
            }
        }
    }
};
__decorate([
    core_1.Input(),
    __metadata("design:type", Array)
], SlickGrid.prototype, "columnDefinitions", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], SlickGrid.prototype, "dataModel", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Rx_1.Observable)
], SlickGrid.prototype, "resized", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Array)
], SlickGrid.prototype, "highlightedCells", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Array)
], SlickGrid.prototype, "blurredColumns", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Array)
], SlickGrid.prototype, "contextColumns", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Boolean)
], SlickGrid.prototype, "showHeader", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Boolean)
], SlickGrid.prototype, "enableColumnReorder", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Boolean)
], SlickGrid.prototype, "enableAsyncPostRender", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], SlickGrid.prototype, "selectionModel", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Array)
], SlickGrid.prototype, "plugins", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Boolean)
], SlickGrid.prototype, "enableEditing", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Number)
], SlickGrid.prototype, "topRowNumber", void 0);
__decorate([
    core_1.Output(),
    __metadata("design:type", core_1.EventEmitter)
], SlickGrid.prototype, "activeRowIndexChange", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Function)
], SlickGrid.prototype, "overrideCellFn", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Function)
], SlickGrid.prototype, "isColumnEditable", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Function)
], SlickGrid.prototype, "isCellEditValid", void 0);
__decorate([
    core_1.Output(),
    __metadata("design:type", core_1.EventEmitter)
], SlickGrid.prototype, "loadFinished", void 0);
__decorate([
    core_1.Output(),
    __metadata("design:type", core_1.EventEmitter)
], SlickGrid.prototype, "editingFinished", void 0);
__decorate([
    core_1.Output(),
    __metadata("design:type", core_1.EventEmitter)
], SlickGrid.prototype, "contextMenu", void 0);
__decorate([
    core_1.Output(),
    __metadata("design:type", core_1.EventEmitter)
], SlickGrid.prototype, "topRowNumberChange", void 0);
__decorate([
    core_1.Output(),
    __metadata("design:type", core_1.EventEmitter)
], SlickGrid.prototype, "cellEditBegin", void 0);
__decorate([
    core_1.Output(),
    __metadata("design:type", core_1.EventEmitter)
], SlickGrid.prototype, "cellEditExit", void 0);
__decorate([
    core_1.Output(),
    __metadata("design:type", core_1.EventEmitter)
], SlickGrid.prototype, "rowEditBegin", void 0);
__decorate([
    core_1.Output(),
    __metadata("design:type", core_1.EventEmitter)
], SlickGrid.prototype, "rowEditExit", void 0);
__decorate([
    core_1.HostListener('focus'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SlickGrid.prototype, "onFocus", null);
SlickGrid = __decorate([
    core_1.Component({
        selector: 'slick-grid',
        template: '<div class="grid" style="width:700px;height:500px" (window:resize)="onResize()"></div>',
        encapsulation: core_1.ViewEncapsulation.None
    }),
    __param(0, core_1.Inject(core_1.forwardRef(() => core_1.ElementRef))),
    __metadata("design:paramtypes", [Object])
], SlickGrid);
exports.SlickGrid = SlickGrid;
