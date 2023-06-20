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
import { Component, OnInit, Input, Output, Optional, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ConfirmationService } from '../../services/confirmation.service';
import { environment } from "environments/environment";
import { MdDialog, MdDialogRef } from '@angular/material';
import { ShowCommitAndVersionDetailsComponent } from './../show-commit-and-version-details/show-commit-and-version-details.component'
import { HttpServiceService } from '../../services/http-service.service';
@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.css']
})
export class AppHeaderComponent implements OnInit {

  // @Input('isDarkTheme')
  // isDarkTheme: Boolean;

  @Input('showRoles')
  showRoles: boolean;

  // @Output()
  // dark: EventEmitter <Boolean> = new EventEmitter<Boolean>();

  // Language Selection
  language_file_path: any = "./assets/";
  app_language: any = "English";
  currentLanguageSet: any;
  languageArray: any;
  status: any;
  isConnected:Boolean=true;

  servicePoint: string;
  userName: string;
  isAuthenticated: boolean;
  roles: any;

  filteredNavigation: any;
  navigation: any;
  reportNavigation: any;
  license:any;

  constructor(
    private router: Router,
    private auth: AuthService,
    public httpServiceService: HttpServiceService,
    private confirmationService: ConfirmationService,
    private dialog: MdDialog) { }
  
  ngOnInit() {
    this.getUIVersionAndCommitDetails()
     this.license = environment.licenseUrl;
    this.servicePoint = localStorage.getItem('tm-servicePointName');
    this.userName = localStorage.getItem('tm-userName');
    this.fetchLanguageSet();
    this.isAuthenticated = sessionStorage.getItem('tm-isAuthenticated') == 'true' ? true : false;
    
  }

  fetchLanguageSet() {
    this.httpServiceService.fetchLanguageSet().subscribe(languageRes => {
      this.languageArray = languageRes;
      this.getLanguage();
    })
    console.log("language array" + this.languageArray);

  }

  changeLanguage(language) {
    
    this.httpServiceService.getLanguage(this.language_file_path+language+".json").subscribe(response => {
      if(response){
        this.languageSuccessHandler(response,language)
      }else{
        alert(this.currentLanguageSet.langNotDefined)
      }      
    },error => {
      alert(this.currentLanguageSet.comingUpWithThisLang + " " + language);
      
    }
    );
  }

  getLanguage() {
    if (sessionStorage.getItem('setLanguage') !== null) {
      this.changeLanguage(sessionStorage.getItem('setLanguage'));
    } else {
      this.changeLanguage(this.app_language);
    }
  }

  languageSuccessHandler(response, language) {
    console.log("language is ", response);
    if (response == undefined) {
      alert(this.currentLanguageSet.langNotDefined)
    }

    if (response[language] !== undefined) {
      this.currentLanguageSet = response[language];
      sessionStorage.setItem('setLanguage', language);
      if (this.currentLanguageSet) {
        this.languageArray.forEach(item => {
          if (item.languageName == language) {
            this.app_language = language;
          
          }

        });
      } else {
        this.app_language = language;
      }
     
      this.httpServiceService.getCurrentLanguage(response[language]);
      this.rolenavigation();
    } else {
      alert(this.currentLanguageSet.comingUpWithThisLang + " " + language);
    }
  }

  rolenavigation(){
  this.navigation = [
    {
      role: 'Supervisor',
      label: this.currentLanguageSet.supervisor,
       work: [
        // { link: ['/telemedicine/timesheet', 'Supervisor'], label: 'Timesheet' },
        { link: '/telemedicine/myStaff', label: this.currentLanguageSet.myStaff },
        { link: 'specialization/dayview', label: this.currentLanguageSet.dayView },
        { link: 'smstemplate', label: this.currentLanguageSet.sMSTemplate }
        // { link: 'appointment/view', label: 'Appointment View' },

      ]
    },
    {
      role: "TC Specialist",
      label: this.currentLanguageSet.tCSpecialist,
       work: [
        { link: ['/telemedicine/timesheet', 'TC Specialist'], label: this.currentLanguageSet.timesheet }
      ]
    }

  ];

  this.reportNavigation = [{
    role: 'Reports',
    label: this.currentLanguageSet.report,
    work: [
      { link: 'chiefComplaintReport', label: this.currentLanguageSet.chiefComplaintReport },
      { link: 'totalConsultationReport', label: this.currentLanguageSet.totalConsultationReport },
      { link: 'consultationReport', label: this.currentLanguageSet.consultationReport },
      { link: 'monthlyReport', label: this.currentLanguageSet.monthlyReport },
      { link: 'dailyReport', label: this.currentLanguageSet.dailyReport }
    ]
  }]

  if (this.showRoles) {
    this.roles = JSON.parse(localStorage.getItem('tm-roles'));
    if (this.roles) {
      this.filteredNavigation = this.navigation.filter(item => {
        return this.roles.includes(item.role);
      })
    }
    console.log(' this.filteredNavigation', this.filteredNavigation);

  }
  }

  DataSync() {
    this.router.navigate(['/datasync'])
  }

  redirectToSpecialistWorklist() {
    let returnUrl = sessionStorage.getItem('tm-return');
    window.location.href = returnUrl;
  }

  returnToMMU: any;
  logout() {
    let loginUrl = sessionStorage.getItem('tm-fallback');
    this.auth.logout().subscribe((res) => {
      this.auth.removeExternalSessionData();
      window.location.href = loginUrl;
    }, error => {
      this.auth.removeExternalSessionData();
      window.location.href = loginUrl;
    });
  }
  getSwymedLogout() {
    this.auth.getSwymedLogout().subscribe((res) => {
      window.location.href = res.data.response;
      this.logout();
    })
  }

  commitDetailsUI: any;
  versionUI: any
  getUIVersionAndCommitDetails() {
    let commitDetailsPath: any = "assets/git-version.json";
    this.auth.getUIVersionAndCommitDetails(commitDetailsPath).subscribe((res) => {
      console.log('res', res);
      this.commitDetailsUI = res
      this.versionUI = this.commitDetailsUI['version']
    }, err => {
      console.log('err', err);

    })
  }
  showVersionAndCommitDetails() {
    this.auth.getAPIVersionAndCommitDetails().subscribe((res) => {
      if (res.statusCode == 200) {
        this.constructAPIAndUIDetails(res.data);
      } else {
      }
    }, err => {
    })
  }
  constructAPIAndUIDetails(apiVersionAndCommitDetails) {
    let data = {
      commitDetailsUI: {
        version: this.commitDetailsUI['version'],
        commit: this.commitDetailsUI['commit']
      },
      commitDetailsAPI: {
        version: apiVersionAndCommitDetails['git.build.version'] || 'NA',
        commit: apiVersionAndCommitDetails['git.commit.id'] || 'NA'
      }
    }
    if (data) {
      this.showData(data)
    }
  }
  showData(versionData) {
    let dialogRef = this.dialog.open(ShowCommitAndVersionDetailsComponent, {
      data: versionData
    });

  }

}
