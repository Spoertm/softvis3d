///
/// softvis3d-frontend
/// Copyright (C) 2020 Stefan Rinderle and Yvo Niedrich
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

import { injectable } from "inversify";
import { Scene } from "three";
import { lazyInject } from "../../../../inversify.config";
import SceneStore from "../../../../stores/SceneStore";
import { SoftVis3dMesh } from "../../domain/SoftVis3dMesh";
import { SoftVis3dShape } from "../../domain/SoftVis3dShape";
import { ObjectFactory } from "./ObjectFactory";
import { SoftVis3dArrow } from "../../domain/SoftVis3dArrow";
import { ArrowType } from "../../domain/SoftVis3dArrowFactory";

/**
 * @class This is a resource manager and loads individual models.
 *
 * @struct
 * @constructor
 */
@injectable()
export class Wrangler {
    private objectsInView: SoftVis3dMesh[] = [];
    private relatedArrowsInView: SoftVis3dArrow[] = [];
    private highlightedHousesInView: SoftVis3dMesh[] = [];
    private selectionColor: number = 0xffc519;
    private _enableHouseHighlighting: boolean = false;

    @lazyInject("SceneStore")
    private readonly sceneStore!: SceneStore;

    public loadSoftVis3d(scene: Scene, data: SoftVis3dShape[]) {
        this.removeAllFromScene(scene);

        this.objectsInView = ObjectFactory.getSceneObjects(data);

        for (const object of this.objectsInView) {
            scene.add(object);
        }
    }

    public updateColorsWithUpdatedShapes(shapes: SoftVis3dShape[], scene: Scene) {
        const resultObjects: SoftVis3dMesh[] = ObjectFactory.getSceneObjects(shapes);

        // update colors
        for (let index = 0; index < resultObjects.length; index++) {
            this.objectsInView[index].color = resultObjects[index].color;
        }

        // update selected object
        if (this.sceneStore.selectedTreeObjects.length > 0) {
            const formerSelectedObject = this.sceneStore.selectedTreeObjects[0].object;
            const formerSelectedObjectId: string = formerSelectedObject.getSoftVis3dId();

            this.sceneStore.selectedTreeObjects = [];
            this.selectSceneTreeObject(formerSelectedObjectId, scene);
        }
    }

    private enableHouseHighlighting() {
        if (!this._enableHouseHighlighting) return;

        for (const arrow of this.relatedArrowsInView) {
            const fromHouse = this.objectsInView.find((obj) => obj.getSoftVis3dId() === arrow.from())!;
            const toHouse = this.objectsInView.find((obj) => obj.getSoftVis3dId() === arrow.to())!;

            fromHouse.color = this.selectionColor;
            toHouse.color = this.selectionColor;

            this.highlightedHousesInView.push(fromHouse, toHouse);
        }
    }

    private disableHouseHighlighting() {
        const objs = ObjectFactory.getSceneObjects(this.sceneStore.shapes);
        for (const house of this.highlightedHousesInView) {
            house.color = objs.find((obj) => obj.getSoftVis3dId() === house.getSoftVis3dId())!.color;
        }

        this.highlightedHousesInView = [];
    }

    private showOnlyViolatingArrows(flag: boolean) {
        if (flag) {
            this.objectsInView
            // hide non-violating arrows
            .filter((obj) => obj instanceof SoftVis3dArrow && !(obj as SoftVis3dArrow).doesViolate)
            .forEach((obj) => {
                obj.visible = false;
            });
        } else {
            this.objectsInView.forEach((obj) => {
                obj.visible = true;
            });
        }
    }

    public selectSceneTreeObject(objectSoftVis3dId: string | null, scene: Scene) {
        // reset former selected objects

        for (const previousSelection of this.sceneStore.selectedTreeObjects) {
            previousSelection.object.color = previousSelection.color;
        }

        if (objectSoftVis3dId === null) {
            this.removeRelatedArrowsIfNeeded(null, scene);
            this.disableHouseHighlighting();
            return;
        }

        const currentSelection = this.objectsInView.find((obj) => obj.getSoftVis3dId() === objectSoftVis3dId);
        if (!currentSelection) return;

        this.removeRelatedArrowsIfNeeded(currentSelection, scene);

        this.sceneStore.selectedTreeObjects = [];

        const selectedObjectInformation = {
            object: currentSelection,
            color: currentSelection.color,
        };

        this.sceneStore.selectedTreeObjects.push(selectedObjectInformation);

        currentSelection.color = this.selectionColor;

        if (currentSelection instanceof SoftVis3dArrow && currentSelection.arrowType === ArrowType.M2M) {
            const relatedArrows = (currentSelection as SoftVis3dArrow).relatedDependencyArrows;

            scene.add(...relatedArrows);
            this.objectsInView.push(...relatedArrows);
            this.relatedArrowsInView.push(...relatedArrows);
        }

        if (this.highlightedHousesInView.length > 0)
            this.disableHouseHighlighting();

        this.enableHouseHighlighting();
    }

    private removeRelatedArrowsIfNeeded(currentSelection: SoftVis3dMesh | null, scene: Scene) {
        const currentSelectionIsM2mArrow = currentSelection instanceof SoftVis3dArrow && currentSelection.arrowType === ArrowType.M2M;

        if (currentSelection === null || currentSelectionIsM2mArrow) {
            scene.remove(...this.relatedArrowsInView);

            // remove related arrows from objectsInView
            for (const objToRemove of this.relatedArrowsInView) {
                const index = this.objectsInView.findIndex(oiv => oiv.getSoftVis3dId() === objToRemove.getSoftVis3dId());
                if (index !== -1) {
                    this.objectsInView.splice(index, 1);
                }
            }

            this.relatedArrowsInView = [];
        }
    }

    public getObjectsInView(): SoftVis3dMesh[] {
        return this.objectsInView;
    }

    public destroy(scene: Scene) {
        this.removeAllFromScene(scene);

        this.objectsInView = [];
        this.sceneStore.selectedTreeObjects = [];
    }

    private removeAllFromScene(scene: Scene) {
        while (this.objectsInView.length) {
            scene.remove(this.objectsInView.pop() as SoftVis3dMesh);
        }
    }

    public set highlightHouses(enableHouseHighlighting: boolean) {
        this._enableHouseHighlighting = enableHouseHighlighting;

        if (enableHouseHighlighting) {
            this.enableHouseHighlighting();
        } else {
            this.disableHouseHighlighting();
        }
    }

    public set showOnlyViolations(showOnlyViolations: boolean) {
        this.showOnlyViolatingArrows(showOnlyViolations);
    }
}
