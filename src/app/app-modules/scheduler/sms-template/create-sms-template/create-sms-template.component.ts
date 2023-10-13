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
import { Component, OnInit, Input, OnChanges, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConfirmationService } from '../../../core/services/confirmation.service';
import { SchedulerService } from '../../shared/services';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { SetLanguageComponent } from '../../../core/components/set-language.component';
import { Http } from '@angular/http';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';
@Component({
  selector: 'app-create-sms-template',
  templateUrl: './create-sms-template.component.html',
  styleUrls: ['./create-sms-template.component.css']
})
export class CreateSmsTemplateComponent implements OnInit {
  @Input('fullSMSTemplate')
  fullSMSTemplate: any;
  languageComponent: SetLanguageComponent;
  currentLanguageSet: any;
  
  constructor(private fb: FormBuilder,
    private schedulerService: SchedulerService,
    public httpServiceService: HttpServiceService,
    private confirmationService: ConfirmationService,
    private location: Location,
    private activatedRoute: ActivatedRoute) { }
  smsTemplateCreationForm: FormGroup

  masterSMSType = [];
  parameters = [];
  templateView: Boolean = false;
  ngOnInit() {
    this.smsTemplateCreationForm = this.createsmsTemplateCreationForm();
    this.getSMSType();
    this.fetchLanguageResponse();
  }
  heading: any;
  getSMSType(view?: String) {
    this.schedulerService.getSMSType().subscribe((res) => {
      console.log('res', res);
      if (res && res.statusCode == 200) {
        this.masterSMSType = res.data;
        if (this.fullSMSTemplate) {
          this.createViewSMSTemplate()
        } else {
          this.heading = this.currentLanguageSet.createSMSTemplate
        }
      } else {
        this.confirmationService.alert(res.errorMessage, 'error')
      }
    }, err => {
      this.confirmationService.alert(err, 'error');
    });
  }

  createViewSMSTemplate() {
    this.mappedSMSParameter = this.fullSMSTemplate.smsParameterMaps
    this.fullSMSTemplate.smsType = this.masterSMSType.filter((smsType) => {
      if (smsType && smsType.smsTypeID && this.fullSMSTemplate.smsType && this.fullSMSTemplate.smsType.smsTypeID)
        return smsType.smsTypeID == this.fullSMSTemplate.smsType.smsTypeID
    })
    this.smsTemplateCreationForm.patchValue(this.fullSMSTemplate);
    this.templateReadOnly = true;
    this.templateView = true;
    this.heading = this.currentLanguageSet.viewSMSTemplate
  }
  get smsTemplate() {
    return this.smsTemplateCreationForm.controls['smsTemplate'].value
  }
  smsTypeID: any
  checkSMSType() {
    this.smsTypeID = this.smsType.smsTypeID;
  }
  createsmsTemplateCreationForm() {
    return this.fb.group({
      smsTemplateName: null,
      smsType: null,
      smsTemplate: null,
      parameter: null,
      smsParameterType: null,
      smsParameterValue: null
    })
  }

  parameterCount: any;
  templateReadOnly: Boolean = false;
  extractParameters() {
    if (this.smsTypeID && this.smsTemplateName && this.smsTemplate) {
      this.parameters = [];
      let tempParameters = [];
      let string_contents = [];
      var regex = /[!?.,\n]/g;
      string_contents = this.smsTemplate.replace(regex, ' ').split(' ');
      for (let i = 0; i < string_contents.length; i++) {
        if (string_contents[i].startsWith('$$') && string_contents[i].endsWith('$$')) {
          let item = string_contents[i].substr(2).slice(0, -2);
          console.log(item);
          tempParameters.push(item);
        }
      }
      this.parameters = tempParameters.filter(function (elem, index, self) {
        return index == self.indexOf(elem);
      });
      this.parameters.push('SMS_PHONE_NO');
      if (this.parameters.length > 0) {
        this.parameterCount = this.parameters.length;
        this.parametersLength = this.parameters.length;
        this.templateReadOnly = true;
      } else {
        this.confirmationService.alert(this.currentLanguageSet.noparametersidentifiedinsmstemplate, 'info');
      }
      console.log('param', this.parameters, this.parameterCount);
    } else {
      this.confirmationService.alert(this.currentLanguageSet.provideallmandatoryfields)
    }


  }
  get parameter() {
    return this.smsTemplateCreationForm.controls['parameter'].value;
  }
  masterSMSParameter = [];
  getSMSparameter() {
    this.schedulerService.getSMSParameter().subscribe((res) => {
      console.log('res', res);
      if (res && res.statusCode == 200) {
        this.masterSMSParameter = res.data;
      } else {
        this.confirmationService.alert(res.errorMessage, 'error')
      }
    }, err => {
      this.confirmationService.alert(err, 'error');
    });
  }
  get smsParameterType() {
    return this.smsTemplateCreationForm.controls['smsParameterType'].value
  }
  selectedParameterValues
  getParameterValue() {
    this.selectedParameterValues = this.smsParameterType.smsParameters
  }
  get smsParameterValue() {
    return this.smsTemplateCreationForm.controls['smsParameterValue'].value;
  }
  mappedSMSParameter = [];
  parametersLength: any;
  addSMSParameterTemplate() {
    let reqObj = {
      'createdBy': localStorage.getItem('tm-userName'),
      'modifiedBy': localStorage.getItem('tm-userName'),
      'smsParameterName': this.parameter,
      'smsParameterType': this.smsParameterType.smsParameterType,
      'smsParameterID': this.smsParameterValue.smsParameterID,
      'smsParameterValue': this.smsParameterValue.smsParameterName
    }
    if (reqObj.smsParameterName != undefined &&
      reqObj.smsParameterType != undefined &&
      reqObj.smsParameterID != undefined) {
      this.mappedSMSParameter.push(reqObj);
    } else {
      this.confirmationService.alert(this.currentLanguageSet.ValueTypeAndValueShouldBeSelected, 'info');
    }

    this.parameters.splice(this.parameters.indexOf(this.parameter), 1);
    this.parametersLength = this.parameters.length;
    this.smsTemplateCreationForm.patchValue({
      parameter: null,
      smsParameterType: null,
      smsParameterValue: null
    });
    this.masterSMSParameter = [];
    this.selectedParameterValues = [];
  }
  removeSMSParameterTemplate(parameter, index) {
    let rem = index - 1;
    this.mappedSMSParameter.splice(rem, 1);
    this.parameters.push(parameter.smsParameterName);
    this.parametersLength = this.parameters.length;
  }

  saveSMStemplate() {
    let requestObject = {
      'createdBy': localStorage.getItem('tm-userName'),
      'providerServiceMapID': localStorage.getItem('tm-providerServiceMapID'),
      'smsParameterMaps': this.mappedSMSParameter,
      'smsTemplate': this.smsTemplate,
      'smsTemplateName': this.smsTemplateName,
      'smsTypeID': this.smsTypeID
    }
    this.schedulerService.saveSMSTemplate(requestObject).subscribe((res) => {
      console.log('res', res);
      if (res && res.statusCode == 200) {
        this.confirmationService.alertConfirm(this.currentLanguageSet.templateCreationSuccess, 'success')
          .subscribe(() => {
            this.location.back();
          });
      } else {
        this.confirmationService.alert(res.errorMessage, 'error')
      }
    }, err => {
      this.confirmationService.alert(err, 'error');
    });
  }

  get smsTemplateName() {
    return this.smsTemplateCreationForm.controls['smsTemplateName'].value
  }

  get smsType() {
    return this.smsTemplateCreationForm.controls['smsType'].value
  }
  goToViewList() {
    this.location.back();
  }

  cancelTemplate() {
    this.templateReadOnly = false;
    this.parameterCount = undefined;
    this.parameters = [];
    this.smsTemplateCreationForm.patchValue({
      parameter: null,
      smsParameterType: null,
      smsParameterValue: null
    });
    this.masterSMSParameter = [];
    this.selectedParameterValues = [];
    this.mappedSMSParameter = [];
  }

  //AN40085822 27/9/2021 Integrating Multilingual Functionality --Start--
  ngDoCheck(){
    this.fetchLanguageResponse();
    if(this.currentLanguageSet !==undefined && this.currentLanguageSet !==null && this.fullSMSTemplate !==undefined && this.fullSMSTemplate !==null){
     // this.createViewSMSTemplate()
        } else {
          this.heading = this.currentLanguageSet.createSMSTemplate
    }
  }

  fetchLanguageResponse() {
    this.languageComponent = new SetLanguageComponent(this.httpServiceService);
    this.languageComponent.setLanguage();
    this.currentLanguageSet = this.languageComponent.currentLanguageObject; 
  }
  //--End--
}
