///
/// softvis3d-frontend
/// Copyright (C) 2016 Stefan Rinderle and Yvo Niedrich
/// stefan@rinderle.info / yvo.niedrich@gmail.com
///
/// This program is free software; you can redistribute it and/or
/// modify it under the terms of the GNU Lesser General Public
/// License as published by the Free Software Foundation; either
/// version 3 of the License, or (at your option) any later version.
///
/// This program is distributed in the hope that it will be useful,
/// but WITHOUT ANY WARRANTY; without even the implied warranty of
/// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
/// Lesser General Public License for more details.
///
/// You should have received a copy of the GNU Lesser General Public
/// License along with this program; if not, write to the Free Software
/// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02
///
import {expect} from "chai";
import {Vector3} from "three";
import VisualizationLinkService, {Parameters} from "../../src/services/VisualizationLinkService";
import {CityBuilderStore} from "../../src/stores/CityBuilderStore";
import Metric from "../../src/classes/Metric";
import {custom, defaultProfile} from "../../src/constants/Profiles";
import {district, evostreet} from "../../src/constants/Layouts";
import {EXPONENTIAL, LINEAR_SCALED} from "../../src/constants/Scales";
import {coverageMetric, packageNameMetric} from "../../src/constants/Metrics";
import {SceneStore} from "../../src/stores/SceneStore";

describe("VisualizationLinkService", () => {

    it("Does nothing on empty string", () => {
        let testCityBuilderStore: CityBuilderStore = new CityBuilderStore();
        let localSceneStore: SceneStore = new SceneStore();
        let underTest: VisualizationLinkService = new VisualizationLinkService(testCityBuilderStore, localSceneStore);

        underTest.process("");

        expect(testCityBuilderStore.initiateBuildProcess).to.be.eq(false);
    });

    it("Extracts the parameters properly", () => {
        let testCityBuilderStore: CityBuilderStore = new CityBuilderStore();
        let localSceneStore: SceneStore = new SceneStore();
        let underTest: VisualizationLinkService = new VisualizationLinkService(testCityBuilderStore, localSceneStore);
        let result: Parameters = underTest.getQueryParams("?test=123&test3=bla&metricWidth=13");

        expect(result.test).to.contain("123");
        expect(result.test3).to.contain("bla");
        expect(result.metricWidth).to.contain("13");
    });

    it("Extracts the parameters properly on single property", () => {
        let testCityBuilderStore: CityBuilderStore = new CityBuilderStore();
        let localSceneStore: SceneStore = new SceneStore();
        let underTest: VisualizationLinkService = new VisualizationLinkService(testCityBuilderStore, localSceneStore);
        let result: Parameters = underTest.getQueryParams("?test=123");

        expect(result.test).to.contain("123");
    });

    it("Should initiate visualization if all values are set", () => {
        let testCityBuilderStore: CityBuilderStore = new CityBuilderStore();
        let localSceneStore: SceneStore = new SceneStore();
        let underTest: VisualizationLinkService = new VisualizationLinkService(testCityBuilderStore, localSceneStore);

        let initialMetrics: Metric[] = [];
        let metricFootprint = new Metric("123", "INT", "siuhf");
        initialMetrics.push(metricFootprint);
        let metricHeight = new Metric("13", "INT", "siuhf2");
        initialMetrics.push(metricHeight);
        testCityBuilderStore.genericMetrics.addMetrics(initialMetrics);

        let expectedSelectedObjectId: string = "123453";
        underTest.process("?metricFootprint=123&metricHeight=13&layout=district&scale=exponential&metricColor=coverage" +
            "&selectedObjectId=" + expectedSelectedObjectId + "&cameraX=1&cameraY=2&cameraZ=3");

        expect(testCityBuilderStore.profile).to.be.eq(custom);
        expect(testCityBuilderStore.profile.footprint).to.be.eq(metricFootprint);
        expect(testCityBuilderStore.profile.height).to.be.eq(metricHeight);
        expect(testCityBuilderStore.metricColor).to.be.eq(coverageMetric);
        expect(testCityBuilderStore.layout).to.be.eq(district);
        expect(testCityBuilderStore.profile.scale).to.be.eq(EXPONENTIAL);

        expect(localSceneStore.cameraPosition).to.be.not.null;
        expect(localSceneStore.cameraPosition).to.be.not.undefined;
        if (localSceneStore.cameraPosition) {
            expect(localSceneStore.cameraPosition.x).to.be.eq(1);
            expect(localSceneStore.cameraPosition.y).to.be.eq(2);
            expect(localSceneStore.cameraPosition.z).to.be.eq(3);
        }
        expect(localSceneStore.selectedObjectId).to.be.eq(expectedSelectedObjectId);

        expect(testCityBuilderStore.show).to.be.eq(false);
        expect(testCityBuilderStore.initiateBuildProcess).to.be.eq(true);
    });

    it("Should initiate visualization if all values are set - other settings", () => {
        let testCityBuilderStore: CityBuilderStore = new CityBuilderStore();
        let localSceneStore: SceneStore = new SceneStore();
        let underTest: VisualizationLinkService = new VisualizationLinkService(testCityBuilderStore, localSceneStore);

        let initialMetrics: Metric[] = [];
        let metricFootprint = new Metric("123", "INT", "siuhf");
        initialMetrics.push(metricFootprint);
        let metricHeight = new Metric("13", "INT", "siuhf2");
        initialMetrics.push(metricHeight);
        testCityBuilderStore.genericMetrics.addMetrics(initialMetrics);

        underTest.process("?metricFootprint=13&metricHeight=123&layout=evostreet&scale=linear_s&metricColor=package" +
            "&cameraX=999&cameraY=88.11&cameraZ=333333.3300");

        expect(testCityBuilderStore.profile).to.be.eq(custom);
        expect(testCityBuilderStore.profile.footprint).to.be.eq(metricHeight);
        expect(testCityBuilderStore.profile.height).to.be.eq(metricFootprint);
        expect(testCityBuilderStore.metricColor).to.be.eq(packageNameMetric);
        expect(testCityBuilderStore.layout).to.be.eq(evostreet);
        expect(testCityBuilderStore.profile.scale).to.be.eq(LINEAR_SCALED);

        expect(localSceneStore.cameraPosition).to.be.not.null;
        expect(localSceneStore.cameraPosition).to.be.not.undefined;
        if (localSceneStore.cameraPosition) {
            expect(localSceneStore.cameraPosition.x).to.be.eq(999);
            expect(localSceneStore.cameraPosition.y).to.be.eq(88.11);
            expect(localSceneStore.cameraPosition.z).to.be.eq(333333.33);
        }

        expect(testCityBuilderStore.show).to.be.eq(false);
        expect(testCityBuilderStore.initiateBuildProcess).to.be.eq(true);
    });

    it("Extracts the parameters properly for mandatory params", () => {
        let localCityBuilderStore = new CityBuilderStore();
        localCityBuilderStore.profile = defaultProfile;

        let localSceneStore: SceneStore = new SceneStore();
        // Math.round in place
        localSceneStore.cameraPosition = new Vector3(1.2, 2.1, 3.3);

        let underTest: VisualizationLinkService = new VisualizationLinkService(localCityBuilderStore, localSceneStore);

        let result = underTest.createVisualizationLink();

        expect(result).to.contain(
            "?metricFootprint=complexity&metricHeight=ncloc&metricColor=none&layout=evostreet&scale=logarithmic" +
            "&cameraX=1&cameraY=2&cameraZ=3");
    });

    it("Extracts the parameters properly with all optional params", () => {
        let localCityBuilderStore = new CityBuilderStore();
        localCityBuilderStore.profile = defaultProfile;

        let localSceneStore: SceneStore = new SceneStore();
        localSceneStore.cameraPosition = new Vector3(1, 2, 3);

        let expectedSelectedObjectId: string = "123453";
        localSceneStore.selectedObjectId = expectedSelectedObjectId;

        let underTest: VisualizationLinkService = new VisualizationLinkService(localCityBuilderStore, localSceneStore);

        let result = underTest.createVisualizationLink();

        expect(result).to.contain(
            "?metricFootprint=complexity&metricHeight=ncloc&metricColor=none&layout=evostreet&scale=logarithmic" +
            "&cameraX=1&cameraY=2&cameraZ=3&selectedObjectId=" + expectedSelectedObjectId);
    });

    it("Visualization link based on already existing params", () => {
        let localCityBuilderStore = new CityBuilderStore();
        let localSceneStore: SceneStore = new SceneStore();
        localCityBuilderStore.profile = defaultProfile;

        let underTest: VisualizationLinkService = new VisualizationLinkService(localCityBuilderStore, localSceneStore);

        let href: string = "http://localhost:9000/plugins/resource/rinderle%3AklamottenwetterWeb?page=SoftVis3D";

        let params: Parameters = {
            test1: "test1Value",
            test2: "test2Value"
        };
        let result = underTest.createVisualizationLinkForCurrentUrl(href, params);

        expect(result).to.be.eq("http://localhost:9000/plugins/resource/rinderle%3AklamottenwetterWeb" +
            "?page=SoftVis3D&test1=test1Value&test2=test2Value");
    });

});
