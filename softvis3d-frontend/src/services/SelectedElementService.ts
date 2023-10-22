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

import { TreeElement } from "../classes/TreeElement";
import { lazyInject } from "../inversify.config";
import SceneStore from "../stores/SceneStore";
import TreeService from "./TreeService";

export default class SelectedElementService {
    @lazyInject("TreeService")
    private readonly treeService!: TreeService;
    @lazyInject("SceneStore")
    private readonly sceneStore!: SceneStore;

    public getSelectedElement(): TreeElement | null {
        let selectedElement: TreeElement | null = null;
        if (this.sceneStore.projectData !== null && this.sceneStore.selectedObjectKey != null) {
            selectedElement = this.treeService.searchTreeNode(
                this.sceneStore.projectData,
                this.sceneStore.selectedObjectKey
            );
        }
        return selectedElement;
    }

    public getSelectedElementByKey(key: string): TreeElement | null {
        let selectedElement: TreeElement | null = null;
        if (this.sceneStore.projectData !== null && key != null) {
            selectedElement = this.treeService.searchTreeNode(this.sceneStore.projectData, key);
        }
        return selectedElement;
    }
}
