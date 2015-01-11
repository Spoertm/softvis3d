/*
 * SoftVis3D Sonar plugin
 * Copyright (C) 2014 - Stefan Rinderle
 * stefan@rinderle.info
 *
 * SoftVis3D Sonar plugin can not be copied and/or distributed without the express
 * permission of Stefan Rinderle.
 */
'use strict';
goog.provide('ThreeViewer.ViewerService');

/**
 * Service which initiates the THREE.js scene and
 *  provides methods to interact with that scene
 *
 * @param {angular.$timeout} $timeout
 * @param {ThreeViewer.MessageBus} MessageBus
 *
 * @constructor
 * @export
 * @ngInject
 */
ThreeViewer.ViewerService = function($timeout, MessageBus){
    this.timeout = $timeout;
    this.MessageBus = MessageBus;
    this.home = null;
};

/**
 * Initialize the 3D scene
 * @param {!object} params
 */
ThreeViewer.ViewerService.prototype.init = function (params){
    this.home = new Viewer.Scene(params);
    this.timeout(function(){
        this.MessageBus.trigger('appReady');
    }.bind(this), SETUP.LOAD_DELAY);
    this.animate();
};

/**
 * @export
 */
ThreeViewer.ViewerService.prototype.animate = function(){
    requestAnimationFrame(this.animate.bind(this));
    this.render();
};

/**
 * @export
 */
ThreeViewer.ViewerService.prototype.render = function () {
    this.home.renderer.render(this.home.scene, this.home.cameras.liveCam);
};

/**
 * See if a mouse click intersects an object.
 * @param {!{x:number, y:number}} mouse
 */
ThreeViewer.ViewerService.prototype.makeSelection = function (mouse) {
    var vector = new THREE.Vector3( mouse.x, mouse.y, 1).unproject(this.home.cameras.liveCam);
    this.home.raycaster.set(this.home.cameras.liveCam.position, vector.sub(this.home.cameras.liveCam.position).normalize());
    var intersected = this.home.raycaster.intersectObjects(this.home.wrangler.collision, true);

    if(intersected.length > 0){
        intersected = intersected[0];
        this.MessageBus.trigger('objectSelected', intersected[0])
    } else {
        intersected = null;
        console.info('No intersection detected');
    }
    return intersected;
};


ThreeViewer.ViewerService.prototype.loadSoftVis3d = function (data) {
    this.home.wrangler.loadSoftVis3d(data);
};

/**
 * Rotate the model
 * @param {!number} x
 * @param {!number} y
 * @param {!number} z
 */
ThreeViewer.ViewerService.prototype.rotate = function (x, y, z) {
    this.home.wrangler.currentModel.rotation.set(
        THREE.Math.degToRad(x),
        THREE.Math.degToRad(y),
        THREE.Math.degToRad(z)
    );
};

/**
 * Translate the model along an axis
 * @param {!number} x
 * @param {!number} y
 * @param {!number} z
 */
ThreeViewer.ViewerService.prototype.translate = function(x, y, z){
    this.home.wrangler.currentModel.position.set(x, y, z)
};

/**
 * @param {!number} s
 */
ThreeViewer.ViewerService.prototype.scale = function(s) {
    this.home.wrangler.currentModel.scale.set(s, s, s);
};

