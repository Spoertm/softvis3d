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

    public selectSceneTreeObject(objectSoftVis3dId: string | null, scene: Scene) {
        // reset former selected objects

        for (const previousSelection of this.sceneStore.selectedTreeObjects) {
            previousSelection.object.color = previousSelection.color;
        }

        if (objectSoftVis3dId === null) {
            this.removeRelatedArrowsIfNeeded(null, scene);
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

        currentSelection.color = 0xffc519;

        if (currentSelection instanceof SoftVis3dArrow && currentSelection.arrowType === "m2m") {
            const relatedArrows = (currentSelection as SoftVis3dArrow).relatedDependencyArrows;
            scene.add(...relatedArrows);
            this.objectsInView.push(...relatedArrows);
            this.relatedArrowsInView.push(...relatedArrows);
        }
    }

    private removeRelatedArrowsIfNeeded(currentSelection: SoftVis3dMesh | null, scene: Scene) {
        const currentSelectionIsC2cArrow = currentSelection instanceof SoftVis3dArrow && currentSelection.arrowType === "c2c";

        if (!currentSelectionIsC2cArrow) {
            scene.remove(...this.relatedArrowsInView);
            this.removeObjectsInView(...this.relatedArrowsInView);
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

    private removeObjectsInView(...object: SoftVis3dMesh[]) {
        for (const objToRemove of object) {
            const index = this.objectsInView.findIndex(oiv => oiv.getSoftVis3dId() === objToRemove.getSoftVis3dId());
            if (index !== -1) {
                this.objectsInView.splice(index, 1);
            }
        }
    }
}