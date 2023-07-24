import './App.css'
import { useEffect } from 'react'
import * as THREE from 'three'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'dat.gui';
import SceneInit from './lib/SceneInit';

const App = () => {
	useEffect(() => {
		const init = new SceneInit('threejs');
		init.initialize();
		init.animate();

		const { scene, camera, renderer, canvas, clock, stats, gui } = init;

		clock.stop();
		//controls
		const controls = new PointerLockControls(camera, canvas);

		canvas.addEventListener('click', function () {
			controls.lock();
			// console.log('locked');
		});

		//textures
		const textureLoader = new THREE.TextureLoader();
		const grid = textureLoader.load('src/assets/grid.png');
		grid.minFilter = THREE.LinearFilter;

		//environment
		const environment = new THREE.Group();
		scene.add(environment);

		const map = new THREE.Mesh(
			new THREE.BoxGeometry(20, 20, 20),
			new THREE.MeshBasicMaterial({
				map: grid,
				side: THREE.DoubleSide,
				// depthTest: false
			})
		);
		map.geometry.computeBoundingBox();
		environment.add(map);

		const floor = new THREE.Mesh(
			new THREE.PlaneGeometry(20, 20),
			new THREE.MeshBasicMaterial({
				map: grid,
				// depthTest: false
			})
		);
		floor.rotation.x = -Math.PI / 2;
		floor.position.y = -2;
		environment.add(floor);

		//raycaster
		const raycaster = new THREE.Raycaster();

		//game
		let started = false;
		let currentIntersect = null;
		let objects = [];
		let hits;
		let misses;
		let whiffs;
		let accuracy;
		let interval;
		let lastSpawn;
		let targetsLeft;

		const startGame = () => {
			console.log('started');
			started = true;
			clock.start();
			hits = 0;
			misses = 0;
			whiffs = 0;
			accuracy = null;
			targetsLeft = Math.floor(params.gameDuration * params.spawnRate);
			interval = params.gameDuration / targetsLeft;
			console.log(params.gameDuration, targetsLeft, interval);
			lastSpawn = params.gameDuration + interval;
		};

		const params = {
			start: startGame,
			gameDuration: 5,
			spawnRate: 2,
			despawnRate: 0.5,
			rangeX: 10,
			rangeY: 10,
			rangeZ: 10,
		};

		gui.add(params, 'start');
		gui.add(params, 'gameDuration').min(10).max(300).step(1);
		gui.add(params, 'spawnRate').min(0.5).max(5).step(0.1);
		gui.add(params, 'despawnRate').min(0.1).max(2).step(0.1);
		gui.add(params, 'rangeX').min(1).max(15).step(0.1);
		gui.add(params, 'rangeY').min(1).max(15).step(0.1);
		gui.add(params, 'rangeZ').min(1).max(15).step(0.1);

		//shooting mechanic
		window.addEventListener('click', (e) => {
			if (currentIntersect) {
				scene.remove(currentIntersect.object);
				objects.splice(
					objects.findIndex(
						(obj) => obj.uuid == currentIntersect.object.uuid
					),
					1
				);
			} else if (started && !currentIntersect) whiffs++;
		});

		//animate
		const tick = () => {
			const elapsedTime = clock.getElapsedTime();
			const timeLeft = (params.gameDuration - elapsedTime).toFixed(2);

			const cameraPosition = new THREE.Vector3();
			const cameraDirection = new THREE.Vector3();
			camera.getWorldPosition(cameraPosition);
			camera.getWorldDirection(cameraDirection);

			raycaster.set(cameraPosition, cameraDirection);

			// timer.innerHTML = `${timeLeft}`;

			console.log(
				timeLeft,
				(lastSpawn - interval).toFixed(2),
				started,
				interval,
				targetsLeft
			);

			if (started && timeLeft === (lastSpawn - interval).toFixed(2)) {
				lastSpawn = timeLeft;
				const object = new THREE.Mesh(
					new THREE.SphereGeometry(0.5, 16, 16),
					new THREE.MeshBasicMaterial({ color: '#ff0000' })
				);

				object.position.x = (Math.random() - 0.5) * params.rangeX;
				object.position.y = Math.random() * (params.rangeY / 2);
				object.position.z = -Math.random() * (params.rangeZ / 2);

				scene.add(object);
				objects.push(object);

				targetsLeft--;

				setTimeout(() => {
					const index = objects.findIndex(
						(obj) => obj.uuid == object.uuid
					);
					if (index > -1) {
						scene.remove(object);
						objects.splice(
							objects.findIndex((obj) => obj.uuid == object.uuid),
							1
						);
						misses++;
					} else {
						hits++;
					}
				}, 1000 / params.despawnRate);
			}

			// if (timeLeft <= 0) timer.innerHTML = '0.00';

			if (accuracy === null && timeLeft <= 0 - 1 / params.despawnRate) {
				clock.stop();
				accuracy = (hits / (hits + whiffs + misses)) * 100;
				console.log('game over!');
				console.log(`You've hit ${hits} Targets!`);
				console.log(`You've missed ${misses} Targets!`);
				console.log(`You've whiffed ${whiffs} Times!`);
				console.log(`WOW you have an accuracy of ${accuracy}%!`);
			}

			if (targetsLeft === 0 && started) started = false;

			const intersects = raycaster.intersectObjects(objects);

			if (intersects.length) {
				if (!currentIntersect) {
					// console.log('entered')
				}
				currentIntersect = intersects[0];
			} else {
				if (currentIntersect) {
					// console.log('exited')
					currentIntersect = null;
				}
			}

			objects.forEach((obj) => obj.material.color.set(0xff0000));
			intersects.forEach((obj) =>
				obj.object.material.color.set(0x00ff00)
			);

			// Call tick again on the next frame
			window.requestAnimationFrame(tick);
		};

		tick();
	});

	return (
		<div>
			<canvas id="threejs" />
		</div>
	);
};

export default App
