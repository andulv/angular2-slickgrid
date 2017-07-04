import { Component, OnInit } from '@angular/core';
import {  ISlickGridColumn, ISlickGridData } from './../../index';


@Component({
    selector: 'my-app',
    templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {
    // private dataRows: IObservableCollection<IGridDataRow>;
    private columnDefinitions: ISlickGridColumn[];

    heroes: Hero[];
    heroesModel: ISlickGridData;

    ngOnInit(): void {
        this.heroes = [
                        new Hero(1, 'Windstorm', new Date(), ''),
                        new Hero(13, 'Bombasto', new Date(), ''),
                        new Hero(15, 'Magneta', new Date(), ''),
                        new Hero(20, 'Tornado', new Date(), '')
                    ];

        // generate columns
        let columns: ISlickGridColumn[] = [
            { id: 'colId',          field: 'id',            name: 'Id',             sortable: true },
            { id: 'colName',        field: 'name',          name: 'Navn',           sortable: true },
            { id: 'colCreatedDate', field: 'createdDate',   name: 'Opprettet dato', sortable: true }
        ];

        this.heroesModel = {
            getLength: (): number => {
                console.log('heroesModel.getLength()');
                return this.heroes.length;
            },
            getItem: (index): any => {
                console.log('heroesModel.getItem()');
                return this.heroes[index];
            },
            getRange: (start, end): any => {
                console.log('heroesModel.getRange, start: ' + start + ', end: ' + end);
                let retValue = this.heroes.slice(start, end);
                return retValue;
            },
            getItemMetadata: undefined
        };

        // let loadDataFunction = (offset: number, count: number): Promise<IGridDataRow[]> => {
        //     return new Promise<IGridDataRow[]>((resolve) => {
        //         let data: IGridDataRow[] = [];
        //         for (let i = offset; i < offset + count; i++) {
        //             let row: IGridDataRow = {
        //                 values: []
        //             };
        //             for (let j = 0; j < numberOfColumns; j++) {
        //                 row.values.push(`column ${j}; row ${i}`);
        //             }
        //             data.push(row);
        //         }
        //         resolve(data);
        //     });
        // };
        // this.dataRows = new VirtualizedCollection<IGridDataRow>(50,
        //                                                         numberOfRows,
        //                                                         loadDataFunction,
        //                                                         (index) => {
        //                                                             return { values: []};
        //                                                         });
        this.columnDefinitions = columns;
    }
}

export class Hero {
  constructor(
    public id: number,
    public name: string,
    public createdDate: Date,
    public description: string
    ) { }
}
