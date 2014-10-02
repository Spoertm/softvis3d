/*
 * SoftViz3d Sonar plugin
 * Copyright (C) 2013 Stefan Rinderle
 * stefan@rinderle.info
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02
 */
package de.rinderle.softviz3d.handler;

import com.google.inject.Inject;
import de.rinderle.softviz3d.tree.ResourceTreeService;
import org.sonar.api.server.ws.Request;
import org.sonar.api.server.ws.Response;
import org.sonar.api.utils.text.JsonWriter;

public class SoftViz3dWebserviceInitializeHandlerImpl implements SoftViz3dWebserviceInitializeHandler {

    @Inject
    private ResourceTreeService resourceTreeService;

    @Override
    public void handle(Request request, Response response) {
        Integer id = Integer.valueOf(request.param("snapshotId"));
        Integer footprintMetricId = Integer.valueOf(request.param("footprintMetricId"));
        Integer heightMetricId = Integer.valueOf(request.param("heightMetricId"));

        resourceTreeService.createTreeStructrue(id, footprintMetricId, heightMetricId);

        JsonWriter json = response.newJsonWriter();
        json.beginObject();
        json.prop("result", "ready");
        json.endObject().close();

    }

}
