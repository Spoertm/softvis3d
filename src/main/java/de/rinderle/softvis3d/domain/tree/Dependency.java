/*
 * SoftVis3D Sonar plugin
 * Copyright (C) 2014 Stefan Rinderle
 * stefan@rinderle.info
 *
 * SoftVis3D Sonar plugin can not be copied and/or distributed without the express
 * permission of Stefan Rinderle.
 */
package de.rinderle.softvis3d.domain.tree;

import java.math.BigInteger;

public class Dependency {

	private BigInteger id;
	private Integer fromNodeId;
	private String fromNodeName;
	private Integer toNodeId;
	private String toNodeName;

	public Dependency(BigInteger id, Integer fromNodeId, String fromNodeName,
			Integer toNodeId, String toNodeName) {
		this.id = id;
		this.fromNodeId = fromNodeId;
		this.fromNodeName = fromNodeName;
		this.toNodeId = toNodeId;
		this.toNodeName = toNodeName;
	}

	public BigInteger getId() {
		return id;
	}

	public Integer getFromNodeId() {
		return fromNodeId;
	}

	public String getFromNodeName() {
		return fromNodeName;
	}

	public Integer getToNodeId() {
		return toNodeId;
	}

	public String getToNodeName() {
		return toNodeName;
	}
}
