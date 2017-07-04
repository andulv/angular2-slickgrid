export interface ISelectionRange {
    startRow: number;
    endRow: number;
    startColumn: number;
    endColumn: number;
}
export interface ISlickGridData {
    getLength(): number;
    getItem(index: number): any;
    getRange(start: number, end: number): any;
    getItemMetadata(index: number): any;
    sortData(sortCols: any[]): void;
}
export interface ISlickGridColumn {
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
