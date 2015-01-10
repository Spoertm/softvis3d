/*
 * SoftVis3D Sonar plugin
 * Copyright (C) 2014 - Stefan Rinderle
 * stefan@rinderle.info
 *
 * SoftVis3D Sonar plugin can not be copied and/or distributed without the express
 * permission of Stefan Rinderle.
 */
'use strict';
goog.provide('ThreeViewer.Filters');

/**
 * @constructor
 */
ThreeViewer.ForceInt = function () {
    this.force = this.force.bind(this);
};

/**
 * @return {function}
 */
ThreeViewer.ForceInt.factory = function () {
    var filter = new ThreeViewer.ForceInt();
    return filter.force;
};

/**
 * @param {!string} input
 * @return {Number}
 */
ThreeViewer.ForceInt.prototype.force = function(input){
    return parseInt(input, 10);
};

/**
 * @constructor
 */
ThreeViewer.ForceFloat= function () {
    this.force = this.force.bind(this);
};

/**
 * @return {function}
 */
ThreeViewer.ForceFloat.factory = function (){
    var filter = new ThreeViewer.ForceFloat();
    return filter.force;
};

/**
 * @param {!string} input
 * @return {Number}
 */
ThreeViewer.ForceFloat.prototype.force = function(input){
    return parseFloat(input);
};