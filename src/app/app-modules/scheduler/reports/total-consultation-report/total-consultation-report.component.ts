/*
* AMRIT – Accessible Medical Records via Integrated Technology 
* Integrated EHR (Electronic Health Records) Solution 
*
* Copyright (C) "Piramal Swasthya Management and Research Institute" 
*
* This file is part of AMRIT.
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see https://www.gnu.org/licenses/.
*/
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { SchedulerService } from '../../shared/services/scheduler.service';
import { ConfirmationService } from '../../../core/services/confirmation.service';

import * as XLSX from 'xlsx';
import * as moment from 'moment';
import { SetLanguageComponent } from '../../../core/components/set-language.component';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';

@Component({
  selector: 'app-total-consultation-report',
  templateUrl: './total-consultation-report.component.html',
  styleUrls: ['./total-consultation-report.component.css']
})
export class TotalConsultationReportComponent implements OnInit {

  totalConsultationForm: FormGroup;

  languageComponent: SetLanguageComponent; 
  currentLanguageSet: any;
  
  constructor(
    private formBuilder: FormBuilder,
    private schedulerService: SchedulerService,
    public httpServiceService: HttpServiceService,
    private confirmationService: ConfirmationService) { }

  providerServiceMapID: any;
  userID: any;
  totalConsultationList = [];
  today: Date;
  minEndDate: Date;
  maxEndDate: Date;

  ngOnInit() {
    this.providerServiceMapID = localStorage.getItem('tm-providerServiceMapID');
    this.userID = localStorage.getItem('tm-userID');
    this.fetchLanguageResponse();
    this.createTotalConsultationForm();

    /* Set Max date*/
    this.maxEndDate = new Date();
    this.today = new Date();
    this.maxEndDate.setDate(this.today.getDate() - 1);
    
  }
  createTotalConsultationForm() {
    this.totalConsultationForm = this.formBuilder.group({
      fromDate: null,
      toDate: null,
    })
  }
  get fromDate() {
    return this.totalConsultationForm.controls['fromDate'].value;
  }

  get toDate() {
    return this.totalConsultationForm.controls['toDate'].value;
  }

  checkEndDate() {
    if (this.toDate == null) {
      this.minEndDate = new Date(this.fromDate);
    } else {
      this.totalConsultationForm.patchValue({
        toDate: null
      });
      //(<FormGroup> this.totalConsultationForm.controls['toDate']).patchValue({ toDate: null });
      if(this.fromDate !=undefined && this.fromDate !=null)
      this.minEndDate = new Date(this.fromDate);
      // this.totalConsultationForm.controls['toDate']).patchValue({
      //   toDate: null
      // })
    }
  }

  downloadReport(downloadFlag) {
    if (downloadFlag == true) {
      this.searchReport();
    }
  }

  searchReport() {
    let reqObjForTotalConsultationReport = {
      "providerServiceMapID": this.providerServiceMapID,
      "userID": this.userID,
      "fromDate": moment(this.fromDate).format("YYYY-MM-DD"),
      "toDate": moment(this.toDate).format("YYYY-MM-DD")
    }
    console.log("reqObjForTotalConsultationReport", JSON.stringify(reqObjForTotalConsultationReport, null, 4));

    this.schedulerService.getTotalConsultationReports(reqObjForTotalConsultationReport).subscribe((response) => {
      console.log("Json data of response: ", JSON.stringify(response, null, 4));
      if (response.statusCode == 200) {
        this.totalConsultationList = response.data;
        this.createSearchCriteria();
      }
      else {
        this.confirmationService.alert(response.errorMessage, 'error');
      }
    }, (err) => {
      this.confirmationService.alert(err, 'error');
    })
  }
  createSearchCriteria() {
    let criteria: any = [];
    criteria.push({ 'Filter_Name': 'From Month', 'value': moment(this.fromDate).format("MMM-YY") });
    criteria.push({ 'Filter_Name': 'To Month', 'value': moment(this.toDate).format("MMM-YY") });
    this.exportToxlsx(criteria);
  }
  exportToxlsx(criteria: any) {
    if (this.totalConsultationList.length > 0) {
      let array = this.checkDataForNull();
      if (array.length != 0) {
        var head = Object.keys(array[0]);
        let wb_name = "Total Consultation Report";
        const criteria_worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(criteria);
        const report_worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.totalConsultationList, { header: (head) });
        let data = this.assignDataToColumns(head, report_worksheet)
        this.createWorkBook(data, wb_name, criteria_worksheet)
      }
      this.confirmationService.alert(this.currentLanguageSet.totalConsultationReportDownloaded, 'success');
    } else {
      this.confirmationService.alert(this.currentLanguageSet.norecordfound);
    }
  }

  checkDataForNull() {
    let array = this.totalConsultationList.filter(function (obj) {
      for (var key in obj) {
        if (obj[key] == null) {
          obj[key] = "";
        }
      }
      return obj;
    });
    return array;
  }

  assignDataToColumns(head, report_worksheet) {

    let i = 65;    // starting from 65 since it is the ASCII code of 'A'.
    let count = 0;
    while (i < head.length + 65) {
      let j;
      if (count > 0) {
        j = i - (26 * count);
      }
      else {
        j = i;
      }
      let cellPosition = String.fromCharCode(j);
      let finalCellName: any;
      if (count == 0) {
        finalCellName = cellPosition + "1";
        console.log(finalCellName);
      }
      else {
        let newcellPosition = String.fromCharCode(64 + count);
        finalCellName = newcellPosition + cellPosition + "1";
        console.log(finalCellName);
      }
      let newName = this.modifyHeader(head, i);
      delete report_worksheet[finalCellName].w; report_worksheet[finalCellName].v = newName;
      i++;
      if (i == 91 + (count * 26)) {
        // i = 65;
        count++;
      }
    }
    return report_worksheet;
  }

  createWorkBook(data, wb_name, criteria_worksheet) {

    const workbook: XLSX.WorkBook = { Sheets: { 'Report': data, 'Criteria': criteria_worksheet }, SheetNames: ['Criteria', 'Report'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: "array" });
    let blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, wb_name);
    }
    else {
      var link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute('visibility', 'hidden');
      link.download = wb_name.replace(/ /g, "_") + ".xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  modifyHeader(headers, i) {
    let modifiedHeader: String;
    modifiedHeader = headers[i - 65].toString().replace(/([A-Z])/g, ' $1').trim();
    modifiedHeader = modifiedHeader.charAt(0).toUpperCase() + modifiedHeader.substr(1);
    return modifiedHeader.replace(/I D/g, "ID");
  }

  //AN40085822 27/9/2021 Integrating Multilingual Functionality --Start--
  ngDoCheck(){
    this.fetchLanguageResponse();
  }

  fetchLanguageResponse() {
    this.languageComponent = new SetLanguageComponent(this.httpServiceService);
    this.languageComponent.setLanguage();
    this.currentLanguageSet = this.languageComponent.currentLanguageObject; 
  }
  //--End--
}
