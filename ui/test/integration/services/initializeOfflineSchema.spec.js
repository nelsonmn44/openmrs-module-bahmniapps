'use strict';

describe('InitializeOfflineSchema Tests', function () {
    var initializeOfflineSchema;

    var mockofflineService = jasmine.createSpyObj('offlineService', ['isChromeApp']);

    beforeEach(function () {
        module('bahmni.common.offline');
        module(function ($provide) {
            $provide.value('offlineService', mockofflineService);
        });
    });

    beforeEach(inject(['initializeOfflineSchema', function (initializeOfflineSchemaInjected) {
        initializeOfflineSchema = initializeOfflineSchemaInjected
    }]));

    it('should initialize offline schema', function (done) {
        mockofflineService.isChromeApp.and.returnValue("true");
        initializeOfflineSchema.initSchema().then(function(db){
            expect(db).not.toBe(null);
            expect(db.getSchema().table(Bahmni.Common.Offline.SchemaDefinitions.Patient.tableName)).not.toBe(null);
            expect(db.getSchema().table(Bahmni.Common.Offline.SchemaDefinitions.PatientAttribute.tableName)).not.toBe(null);
            expect(db.getSchema().table(Bahmni.Common.Offline.SchemaDefinitions.PatientAttributeType.tableName)).not.toBe(null);
            expect(db.getSchema().table(Bahmni.Common.Offline.SchemaDefinitions.EventLogMarker.tableName)).not.toBe(null);
            expect(db.getSchema().table(Bahmni.Common.Offline.SchemaDefinitions.AddressHierarchyEntry.tableName)).not.toBe(null);
            expect(db.getSchema().table(Bahmni.Common.Offline.SchemaDefinitions.AddressHierarchyLevel.tableName)).not.toBe(null);
            done();
        });


    });

});