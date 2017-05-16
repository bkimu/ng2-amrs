import { Component, OnInit, ViewChild, Output, EventEmitter, Input } from '@angular/core';

import * as Moment from 'moment';
import {
  HivSummaryIndicatorsResourceService
} from '../../etl-api/hiv-summary-indicators-resource.service';

@Component({
  selector: 'hiv-summary-report-base',
  template: 'hiv-summary-report-base.component.html'
})
export class HivSummaryIndicatorBaseComponent implements OnInit {
  public data = [];
  public sectionsDef = [];
  public isAggregated: boolean;
  public startAge: number;
  public endAge: number;
  public indicators: string ;
  public selectedIndicator  = [];

  public isLoadingReport: boolean = false;
  public encounteredError: boolean = false;
  public errorMessage: string = '';
  public currentView: string = 'tabular'; // can be pdf or tabular or patientList
  public reportName: string = 'hiv-summary-report';
  @Input() ageRangeStart: number;
  @Input() ageRangeEnd: number;


  private _startDate: Date = Moment().subtract(1, 'months').toDate();
  public get startDate(): Date {
    return this._startDate;
  }
  public set startDate(v: Date) {
    this._startDate = v;
  }


  private _endDate: Date = new Date();
  public get endDate(): Date {
    return this._endDate;
  }
  public set endDate(v: Date) {
    this._endDate = v;
  }

  private _locationUuids: Array<string>;
  public get locationUuids(): Array<string> {
    return this._locationUuids;
  }
  public set locationUuids(v: Array<string>) {
    this._locationUuids = v;
  }
  private _gender: Array<string>;
  public get gender(): Array<string> {
    return this._gender;
  }
  public set gender(v: Array<string>) {
    this._gender = v;
  }

  constructor(public hivSummaryIndicatorsResourceService: HivSummaryIndicatorsResourceService) { }

  ngOnInit() {}
  generateReport() {
    // set busy indications variables
    // clear error
    this.encounteredError = false;
    this.errorMessage = '';
    this.isLoadingReport = true;
    this.hivSummaryIndicatorsResourceService
      .getHivSummaryIndicatorsReport({
          endDate: this.toDateString(this.endDate),
          gender: this.gender,
          startDate: this.toDateString(this.startDate),
          indicators: this.indicators,
          locationUuids: this.getSelectedLocations(this.locationUuids),
          startAge: this.startAge,
          endAge: this.endAge
       }).subscribe(
      (data) => {;
        this.isLoadingReport = false;
        this.sectionsDef =   data.indicatorDefinitions;
        this.data = data.result;
      }, (error) => {
        this.isLoadingReport = false;
        this.errorMessage = error;
        this.encounteredError = true;
      });
  }
  onAgeChangeFinished($event) {
    this.startAge = $event.ageFrom;
    console.log('$event', $event);
    this.endAge = $event.ageTo;
  }
  getSelectedGender(gender) {
    this.gender = gender.toString();
  }
  getSelectedIndicators(selectedIndicator) {
    this.selectedIndicator = selectedIndicator;
    let indicators;
    if (selectedIndicator)
      for (let i = 0; i < selectedIndicator.length; i++) {
        if (i === 0) {
          indicators = '' + selectedIndicator[i];
        } else {
          indicators = indicators + ',' + selectedIndicator[i];
        }
      }
    return this.indicators = indicators;
  }
  public onTabChanged(event) {
    if (event.index === 0) {
      this.currentView = 'tabular';
    }
  }
  private getSelectedLocations(locationUuids: Array<string>): string {
    if (!locationUuids || locationUuids.length === 0) {
      return '';
    }

    let selectedLocations = '';

    for (let i = 0; i < locationUuids.length; i++) {
      if (i === 0) {
        selectedLocations = selectedLocations + locationUuids[0];
      } else {
        selectedLocations = selectedLocations + ',' + locationUuids[i];
      }
    }
    return selectedLocations;
  }

  private toDateString(date: Date): string {
    return Moment(date).utcOffset('+03:00').format();
  }

}
