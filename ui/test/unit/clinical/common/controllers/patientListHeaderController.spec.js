'use strict';

describe("PatientListHeaderController", function () {

    var scope, ngDialog,
        $bahmniCookieStore, locationService, $window, retrospectiveEntryService,
        providerService, rootScope, thisController, locationsPromise, offlineService, schedulerService;
    var date = "2015-01-11";
    var encounterProvider = {value: "Test", uuid: "Test_UUID"};


    beforeEach(module('bahmni.clinical'));
    beforeEach(inject(function ($rootScope) {
        rootScope = $rootScope;
        rootScope.retrospectiveEntry = {};
        scope = $rootScope.$new();
    }));

    beforeEach(inject(function ($controller) {
        $bahmniCookieStore = jasmine.createSpyObj('$bahmniCookieStore', ['remove', 'put', 'get']);
        $bahmniCookieStore.get.and.callFake(function (cookie) {
            if (cookie == Bahmni.Common.Constants.grantProviderAccessDataCookieName) {
                return encounterProvider;
            }
            if (cookie == Bahmni.Common.Constants.locationCookieName) {
                return {uuid: 1, display: "Location" };
            }
        });

        locationService = jasmine.createSpyObj('locationService', ['getAllByTag']);
        retrospectiveEntryService = jasmine.createSpyObj('retrospectiveEntryService', ['getRetrospectiveDate', 'resetRetrospectiveEntry']);
        retrospectiveEntryService.getRetrospectiveDate.and.callFake(function () {
            return date;
        });
        locationsPromise = Q.defer();
        locationService.getAllByTag.and.callFake(function () {
            locationsPromise.resolve();
            return specUtil.respondWith({"data": {"results": [
                {display: "OPD1", uuid: 1},
                {display: "Registration", uuid: 2}
            ]}});
        });
        providerService = jasmine.createSpyObj('providerService', ['search']);
        offlineService = jasmine.createSpyObj('offlineService', ['isOfflineApp']);
        schedulerService = jasmine.createSpyObj('schedulerService', ['sync','stopSync']);
        $window = {location: { reload: jasmine.createSpy()} };

        offlineService.isOfflineApp.and.returnValue(true);

        thisController = $controller('PatientListHeaderController', {
            $scope: scope,
            $bahmniCookieStore: $bahmniCookieStore,
            providerService: providerService,
            locationService: locationService,
            retrospectiveEntryService: retrospectiveEntryService,
            $window: $window,
            ngDialog: ngDialog,
            offlineService: offlineService,
            schedulerService: schedulerService
        });
        thisController.windowReload = function () {
        };

    }));

    it("should initialize the appropriate cookie date and change cookie on select", function () {
        locationsPromise.promise.then(function () {
            expect(scope.date.toString()).toEqual(new Date(date).toString());
            expect(scope.encounterProvider).toBe(encounterProvider);
            expect(scope.locations[0].display).toBe("OPD1");
            expect(scope.locations[1].display).toBe("Registration");
            expect(scope.selectedLocationUuid).toBe(1);

            scope.windowReload();

            expect($bahmniCookieStore.put).toHaveBeenCalled();
            expect(retrospectiveEntryService.getRetrospectiveDate).toHaveBeenCalled();
            expect($bahmniCookieStore.put.calls.count()).toEqual(2);
            expect(scope.isOffline).toBeTruthy();
        });

    });

    it("should set isOfflineApp  to true if it is chrome or android app in offlineApp", function () {
        scope.$digest();
        expect(offlineService.isOfflineApp).toHaveBeenCalled();
        expect(scope.isOfflineApp).toBeTruthy();
    });

    it("should set isSyncing to true  when user clicks on sync button in offlineApp", function () {
        scope.$digest();
        expect(offlineService.isOfflineApp).toHaveBeenCalled();

        rootScope.$broadcast("schedulerStage","stage1");
        expect(scope.isSyncing).toBeTruthy();
    });

    it("should set isSyncing to false when syncing is not happening  and should not restart Sync in offlineApp", function () {

        scope.$digest();
        rootScope.$broadcast("schedulerStage",null);

        expect(schedulerService.sync).not.toHaveBeenCalled();
        expect(schedulerService.stopSync).not.toHaveBeenCalled();
        expect(scope.isSyncing).toBeFalsy();
    });

    it("should restart scheduler when there is an error in offlineApp", function () {
        scope.$digest();
        rootScope.$broadcast("schedulerStage",null, true);
        expect(schedulerService.sync).toHaveBeenCalled();
        expect(schedulerService.stopSync).toHaveBeenCalled();

    });

    it("should not restart scheduler when there are no errors  in offlineApp", function () {
        scope.$digest();
        rootScope.$broadcast("schedulerStage",null, false);

        expect(schedulerService.sync).not.toHaveBeenCalled();
        expect(schedulerService.stopSync).not.toHaveBeenCalled();
    });

});