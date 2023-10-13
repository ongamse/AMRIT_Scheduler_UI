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
import { ConfirmationService } from '../../../core/services/confirmation.service';
import { SchedulerService } from '../../shared/services';
import { Router } from '@angular/router';
import { SetLanguageComponent } from '../../../core/components/set-language.component';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';
@Component({
  selector: 'app-sms-template-list',
  templateUrl: './sms-template-list.component.html',
  styleUrls: ['./sms-template-list.component.css']
})
export class SmsTemplateListComponent implements OnInit {

  languageComponent: SetLanguageComponent;
  currentLanguageSet: any;
  
  constructor(private schedulerService: SchedulerService,
    private confirmationService: ConfirmationService,
    public httpServiceService: HttpServiceService,
    private router: Router) { }

  ngOnInit() {
    this.getAllSMSTemplates();
    this.fetchLanguageResponse();
  }
  templateList = [];
  getAllSMSTemplates() {
    this.schedulerService.getAllSMSTemplates().subscribe((res) => {
      console.log('res', res);
      if (res && res.statusCode == 200) {
        this.templateList = res.data;
      } else {
        this.confirmationService.alert(res.errorMessage, 'error')
      }
    }, err => {
      this.confirmationService.alert(err, 'error');
    });
  }
  viewFullSMSTemplate(template) {
    console.log('template', template);
    this.router.navigate(['telemedicine/viewSMSTemplate', template.providerServiceMapID, template.smsTemplateID])
  }
  createNewSMSTemplate() {
    this.router.navigate(['telemedicine/createsmstemplate'])
  }

  activateDeactivate(template, flag) {
    template.deleted = flag;
    template.modifiedBy = localStorage.getItem('tm-userName');
    this.schedulerService.updateSMSTemplate(template).subscribe((res) => {
      console.log('res', res);
      if (res && res.statusCode == 200) {
        if (flag) {
          this.confirmationService.alert(this.currentLanguageSet.deactivatedsuccessfully, 'success');
          this.getAllSMSTemplates();
        } else {
          this.confirmationService.alert(this.currentLanguageSet.activatedsuccessfully, 'success');
          this.getAllSMSTemplates();
        }
      } else {
        this.confirmationService.alert(res.errorMessage, 'error')
      }
    }, err => {
      this.confirmationService.alert(err, 'error');
    });
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
