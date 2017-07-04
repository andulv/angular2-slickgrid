import { Component, OnInit } from '@angular/core';
import {  ISlickGridColumn, ISlickGridData } from './../../index';


@Component({
    selector: 'my-app',
    templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {
    private columnDefinitions: ISlickGridColumn[];

    heroes: Hero[];
    heroesModel: ISlickGridData;
    gridActiveRowIndex: number = 1;

    grid_activeRowIndexChange(event: number): void {
        this.gridActiveRowIndex = event;
    }

    ngOnInit(): void {
        this.heroes = [
                        new Hero(1, 'Windstorm', new Date(), 'Superhelt'),
                        new Hero(15, 'Magneta', new Date(), 'Superhelt'),
                        new Hero(17, 'Lemmy', new Date(), 'Gud'),
                        new Hero(18, 'Kaptein Sabeltann', new Date(), 'Farlig mann'),
                        new Hero(20, 'Tornado', new Date(), 'Superhelt')
                    ];

        this.columnDefinitions = [
            { id: 'colId',          field: 'id',            name: 'Id',             sortable: true },
            { id: 'colDescription', field: 'description',   name: 'Beskrivelse',    sortable: true },
            { id: 'colName',        field: 'name',          name: 'Navn',           sortable: true },
            { id: 'colCreatedDate', field: 'createdDate',   name: 'Opprettet dato', sortable: true }
        ];

        // This is the model that is invoked by the grid when it needs data
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

            getItemMetadata: undefined,

            sortData: (sortCols): void => {
                console.log('heroesModel.sortData() sortCols.length: ' + sortCols.length);
                this.heroes.sort((dataObject1, dataObject2) => {
                    for (let i = 0, l = sortCols.length; i < l; i++) {
                        let field = sortCols[i].sortCol.field;
                        let sign = sortCols[i].sortAsc ? 1 : -1;
                        let value1 = dataObject1[field], value2 = dataObject2[field];
                        let result = (value1 === value2 ? 0 : (value1 > value2 ? 1 : -1)) * sign;
                        if (result !== 0) {
                            return result;
                        }
                    }
                    return 0;
                });
            }
        };
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
