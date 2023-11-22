# AMRIT - Scheduler
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)  ![branch parameter](https://github.com/PSMRI/HWC-API/actions/workflows/sast-and-package.yml/badge.svg)

It acts as an interface between client and the scheduling services provided, allowing users to interact for consultation with specialists. It also provides the info of availability and unavailability of specialists, retrieving available slots for specialists, booking and cancelling slots, and fetching day views of specialists for a particular specialization.

### Features
* Handles various requests for scheduling/booking/cancelling slots
* Provides slots availability
* provides specialists availability of any day

## Prerequisite
* Java 1.8
* maven
* node 16

## Run
* npm install -g @angular/cli
* npm install typescript@2.7.2 --save-dev
* npm install
* npm run build
* mvn clean install
* npm start

## Building from source

1. To build deployable war files
```bash
mvn -B package --file pom.xml -P <profile_name>
```

The available profiles include dev, local, test, and ci.
Refer to `src/environments/environment.ci.template` file and ensure that the right environment variables are set for the build.

Packing with `ci` profile calls `build-ci` script in `package.json`.
It creates a `environment.ci.ts` file with all environment variables used in the generated build.

