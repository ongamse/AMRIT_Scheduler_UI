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
import { SchedulerService } from '../shared/services';
import { Router } from '@angular/router';
import { HttpServiceService } from 'app/app-modules/core/services/http-service.service';
import { SetLanguageComponent } from 'app/app-modules/core/components/set-language.component';

@Component({
  selector: 'app-mystaff',
  templateUrl: './mystaff.component.html',
  styleUrls: ['./mystaff.component.css']
})
export class MystaffComponent implements OnInit {

  specialistList = [];
  filterTerm: any;
  filteredSpecialistList = [];
  specializationMaster = [];
  selectedSpecialization: any;
  currentLanguageSet:any;
  languageComponent: SetLanguageComponent;

  constructor(private schedulerService: SchedulerService,
    public httpServiceService:HttpServiceService,
    private router: Router) { }

  ngOnInit() {
    let specialistListReq = {
      "specializationID": 0,
      "providerServiceMapID": localStorage.getItem('tm-providerServiceMapID'),
      "userID": localStorage.getItem('tm-userID')
    }
    this.fetchLanguageResponse();
    this.getAllSpecialist(specialistListReq);
    this.getSpecialisationMaster();
  }

  getAllSpecialist(specialistListReq) {
    this.schedulerService.getAllSpecialist(specialistListReq).subscribe((response) => {
      if (response.statusCode == 200) {
        this.specialistList = response.data;
        this.filteredSpecialistList = response.data;
      }
      console.log('Specialist List..', this.specialistList);
    })
  }

  getSpecialisationMaster() {
    this.schedulerService.getSpecializationMaster()
      .subscribe(res => {
        if (res.statusCode == 200 && res.data) {
          this.specializationMaster = res.data;
        }
      });
  }

  openProfile(specialist) {
    console.log('Opening profile..');
    let userID = specialist.userID;
    localStorage.setItem('supervisor-specialistID',userID);
    
    this.router.navigate(['telemedicine/profile', userID]);
  }

  filterSpecialist() {
    let filter1 = this.specialistList;
    let filter2 = this.filterBySearch(this.filterTerm, filter1);
    let filter3 = this.filterBySpec(this.selectedSpecialization, filter2);

    this.filteredSpecialistList = filter3;
  }

  filterBySpec(selectedSpecialization: String, filteredSpecialist) {
    if (selectedSpecialization == undefined || selectedSpecialization == null || selectedSpecialization == "All") {
      return filteredSpecialist;
    } else {
      let filteredSpecialistList = [];
      filteredSpecialist.forEach(item => {
        if (item.specialization == this.selectedSpecialization) {
          filteredSpecialistList.push(item);
        }
      });
      return filteredSpecialistList;
    }
  }

  filterBySearch(searchTerm: String, filteredSpecialist) {
    console.log('filteredSpecialist', filteredSpecialist);
    if (searchTerm == undefined || searchTerm == null || searchTerm == "") {
      return filteredSpecialist;
    } else {
      let filteredSpecialistList = [];
      filteredSpecialist.forEach(item => {
        console.log("item", JSON.stringify(item, null, 4));
        for (let key in item) {
          if (
            key == "firstName" || key == "lastName"
          ) {
            let value: string = "" + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              filteredSpecialistList.push(item);
              break;
            }
          }
        }
        console.log('filteredSpecialistList', filteredSpecialistList);
      });
      return filteredSpecialistList;
    }
  }

  // AV40085804 27/09/2021 Integrating Multilingual Functionality -----Start-----
  ngDoCheck() {
    this.fetchLanguageResponse();
  }

  fetchLanguageResponse() {
    this.languageComponent = new SetLanguageComponent(this.httpServiceService);
    this.languageComponent.setLanguage();
    this.currentLanguageSet = this.languageComponent.currentLanguageObject;
  }
  // -----End------
}
