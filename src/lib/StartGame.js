import * as THREE from 'three';
import cloneDeep from 'lodash/cloneDeep';

const getValue = (name) => JSON.parse(window.localStorage.getItem(name)).value;

const fetchedSettings = {
	spawnRate: getValue('spawnRate'),
	despawnRate: getValue('despawnRate'),
	spread: getValue('spread'),
	sensitivity: getValue('sensitivity'),
};

const params = {
	gameDuration: 10,
	spawnRate: fetchedSettings.spawnRate || 2,
	despawnRate: fetchedSettings.despawnRate || 0.5,
	spread: fetchedSettings.spread || 10,
};

let currentIntersect = null;
let elapsedTime = 0;

let objects = [];
let despawnStack = [];
const spawnInterval =
	params.gameDuration / Math.floor(params.gameDuration * params.spawnRate);

const StartGame = (init, gameInfo, setGameInfo, setTime, setCurrentScreen) => {
	const { scene, camera, canvas, clock } = init;
	const gameInfoClone = cloneDeep(gameInfo);

	let { hits, misses, whiffs, accuracy } = gameInfoClone.score;

	const updateObjects = () => {
		objects = [];
		scene.children.forEach((obj) => {
			if (obj.name === 'target') objects.push(obj);
		});
	};

	//spawn ball
	const spawnBall = () => {
		gameInfoClone.nextSpawn = gameInfoClone.timeLeft - spawnInterval;
		const object = new THREE.Mesh(
			new THREE.SphereGeometry(0.5, 16, 16),
			new THREE.MeshBasicMaterial({ color: '#ff0000' })
		);

		object.position.x = (Math.random() - 0.5) * params.spread;
		object.position.y = Math.random() * (params.spread / 2);
		object.position.z = -Math.random() * (params.spread / 2);
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
		setCurrentScreen('');
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

		console.log(
			gameInfoClone.timeLeft,
			gameInfoClone.nextSpawn.toFixed(2),
			gameInfoClone.started,
			spawnInterval,
			gameInfoClone.targetsLeft,
			objects.length
		);

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
