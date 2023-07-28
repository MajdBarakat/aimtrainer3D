import * as THREE from 'three';
import cloneDeep from 'lodash/cloneDeep';
import { update } from 'lodash';

const params = {
	// start: startGame,
	gameDuration: 5,
	spawnRate: 2,
	despawnRate: 0.5,
	rangeX: 10,
	rangeY: 10,
	rangeZ: 10,
};

let currentIntersect = null;
let hits = 0;
let misses = 0;
let whiffs = 0;
let accuracy = null;
let elapsedTime = 0;

let objects = [];
let despawnStack = [];
const spawnInterval =
	params.gameDuration / Math.floor(params.gameDuration * params.spawnRate);

const StartGame = (init, gameInfo, setGameInfo, setTime, setCurrentScreen) => {
	const { scene, camera, canvas, clock } = init;
	const gameInfoClone = cloneDeep(gameInfo);

	const updateObjects = () => {
		objects = [];
		scene.children.forEach((obj) => {
			if (obj.name === 'target') objects.push(obj);
		});
		console.log(objects);
	};

	//spawn ball
	const spawnBall = () => {
		gameInfoClone.nextSpawn = gameInfoClone.timeLeft - spawnInterval;
		const object = new THREE.Mesh(
			new THREE.SphereGeometry(0.5, 16, 16),
			new THREE.MeshBasicMaterial({ color: '#ff0000' })
		);

		object.position.x = (Math.random() - 0.5) * params.rangeX;
		object.position.y = Math.random() * (params.rangeY / 2);
		object.position.z = -Math.random() * (params.rangeZ / 2);
		object.name = 'target';

		scene.add(object);
		updateObjects();
		setDespawnTime(object);
		gameInfoClone.targetsLeft--;
	};

	const setDespawnTime = (object) => {
		const despawnTime = gameInfoClone.timeLeft - 1 / params.despawnRate;
		const despawnObj = {
			uuid: object.uuid,
			despawnTime,
		};
		despawnStack.push(despawnObj);
	};

	const despawnBall = () => {
		const { uuid } = despawnStack[0];
		const index = scene.children.findIndex((obj) => obj.uuid == uuid);
		if (index > -1) {
			scene.remove(scene.children[index]);
			updateObjects();
			misses++;
		}
		despawnStack.shift();
	};

	const endGame = () => {
		clock.stop();
		accuracy = (hits / (hits + whiffs + misses)) * 100;
		objects?.forEach((obj) => scene.remove(obj));
		console.log('game over!');
		console.log(`You've hit ${hits} Targets!`);
		console.log(`You've missed ${misses} Targets!`);
		console.log(`You've whiffed ${whiffs} Times!`);
		console.log(`WOW you have an accuracy of ${accuracy}%!`);
		return hits, misses, whiffs;
	};

	//raycaster
	const raycaster = new THREE.Raycaster();

	//shooting mechanic
	canvas.addEventListener('click', (e) => {
		if (gameInfoClone.started && currentIntersect) {
			scene.remove(currentIntersect.object);
			updateObjects();
			hits++;
		} else if (gameInfoClone.started && !currentIntersect) whiffs++;
	});

	gameInfoClone.targetsLeft =
		gameInfoClone.targetsLeft ||
		Math.floor(params.gameDuration * params.spawnRate);
	gameInfoClone.nextSpawn = gameInfoClone.nextSpawn || params.gameDuration;

	clock.start();

	//game
	const tick = () => {
		// updateObjects();

		elapsedTime =
			clock.getElapsedTime() + gameInfoClone.lastRecordedElapsedTime;

		gameInfoClone.timeLeft = (params.gameDuration - elapsedTime).toFixed(2);

		// console.log(
		// 	gameInfoClone.timeLeft,
		// 	gameInfoClone.nextSpawn.toFixed(2),
		// 	gameInfoClone.started,
		// 	spawnInterval,
		// 	gameInfoClone.targetsLeft,
		// 	objects.length
		// );

		if (
			clock.running &&
			gameInfoClone.spawning &&
			gameInfoClone.timeLeft <= gameInfoClone.nextSpawn.toFixed(2)
		)
			spawnBall();

		// despawn ball
		if (
			despawnStack.length &&
			gameInfoClone.timeLeft <= despawnStack[0].despawnTime
		)
			despawnBall();

		//end of game
		if (
			accuracy === null &&
			gameInfoClone.timeLeft <= 0 - 1 / params.despawnRate
		)
			endGame();

		if (gameInfoClone.targetsLeft === 0 && gameInfoClone.started) {
			gameInfoClone.spawning = false;
		}

		//object detection
		const cameraDirection = new THREE.Vector3();
		const cameraPosition = new THREE.Vector3();
		camera.getWorldDirection(cameraDirection);
		camera.getWorldPosition(cameraPosition);

		raycaster.set(cameraPosition, cameraDirection);

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

		//set hover color
		objects.forEach((obj) => obj.material.color.set(0xff0000));
		intersects.forEach((obj) => obj.object.material.color.set(0x00ff00));

		//update data
		setTime(gameInfoClone.timeLeft > 0 ? gameInfoClone.timeLeft : '0.00');
		// Call tick again on the next frame
		if (clock.running) {
			setGameInfo(gameInfoClone);
			window.requestAnimationFrame(tick);
		}
	};

	tick();
};

export default StartGame;
