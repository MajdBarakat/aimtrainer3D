import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import * as dat from 'dat.gui';

export default class SceneInit {
	constructor(canvasId, animateCallback) {
		//core components to initialize Three.js app.
		this.scene = undefined;
		this.camera = undefined;
		this.renderer = undefined;

		//camera params;
		this.fov = 75;
		this.nearPlane = 0.1;
		this.farPlane = 1000;
		this.canvas = document.getElementById(canvasId);

		//additional components.
		this.clock = undefined;
		// this.stats = undefined;
		// this.gui = undefined;

		//lighting is basically required.
		this.ambientLight = undefined;

		//animation callbacks
		this.animateCallback = animateCallback || undefined;
	}

	initialize() {
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(
			this.fov,
			window.innerWidth / window.innerHeight,
			1,
			1000
		);
		this.camera.position.z = 8;
		this.camera.position.y = -0.5;

		//specify a canvas which is already created in the HTML.
		this.renderer = new THREE.WebGLRenderer({
			canvas: this.canvas,
			antialias: true,
		});
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		// document.body.appendChild(this.renderer.domElement);

		this.clock = new THREE.Clock();
		// this.stats = Stats();
		// document.body.appendChild(this.stats.dom);
		// this.gui = new dat.GUI();

		// ambient light
		this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
		this.ambientLight.castShadow = true;
		this.scene.add(this.ambientLight);

		// if window resizes
		window.addEventListener('resize', () => this.onWindowResize(), false);

		// NOTE: Load space background.
		// this.loader = new THREE.TextureLoader();
		// this.scene.background = this.loader.load('./pics/space.jpeg');
	}

	animate() {
		this.render();
		// this.stats.update();
		this.animateCallback && this.animateCallback();
		window.requestAnimationFrame(this.animate.bind(this));
	}

	render() {
		// NOTE: Update uniform data on each render.
		this.renderer.render(this.scene, this.camera);
	}

	onWindowResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		// const distance = 50;
		// const frustumHeight =
		// 	2 * distance * Math.tan((this.camera.fov / 2) * (Math.PI / 180));
		// const frustumWidth = frustumHeight / this.camera.aspect;
		// const frustumSize = (frustumHeight * frustumWidth * distance) / 3;

		// this.camera.left = (-frustumSize * this.camera.aspect) / 2;
		// this.camera.right = (frustumSize * this.camera.aspect) / 2;
		// this.camera.top = frustumSize / 2;
		// this.camera.bottom = -frustumSize / 2;

		this.camera.updateProjectionMatrix();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	}
}
