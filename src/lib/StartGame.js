import * as THREE from 'three';
import _ from 'lodash';
import config from '../config/config.json';

const getValue = (name) => {
	const setting = window.localStorage.getItem(name);
	return setting ? JSON.parse(setting).value : setting;
};

let currentIntersect = null;
let elapsedTime = 0;

let objects = [];
let despawnStack = [];
let intersects = [];
let grid;
const gridx = 3;
const gridy = 3;

const StartGame = (init, gameInfo, setGameInfo, setTime, setCurrentScreen) => {
	const fetchedSettings = {
		gameMode: getValue('gameMode'),
		spawnRate: getValue('spawnRate'),
		despawnRate: getValue('despawnRate'),
		spread: getValue('spread'),
		// sensitivity: getValue('sensitivity'),
	};

	const params = {
		gameDuration: 1,

		spawnRate:
			fetchedSettings.spawnRate || config.settingsDefaultValues.spawnRate,

		despawnRate:
			fetchedSettings.despawnRate ||
			config.settingsDefaultValues.despawnRate,

		spread: fetchedSettings.spread || config.settingsDefaultValues.spread,
	};

	const spawnInterval =
		params.gameDuration /
		Math.floor(params.gameDuration * params.spawnRate);

	const { scene, camera, canvas, clock } = init;
	const gameInfoClone = _.cloneDeep(gameInfo);

	let { hits, misses, whiffs, accuracy } = gameInfoClone.score;

	const updateObjects = () => {
		objects = [];
		scene.children.forEach((obj) => {
			if (obj.name === 'target') objects.push(obj);
		});
	};

	gameInfoClone.started = true;

	const spawnBall = () => {
		const object = new THREE.Mesh(
			new THREE.SphereGeometry(0.5, 16, 16),
			new THREE.MeshBasicMaterial({ color: '#ff0000' })
		);

		if (fetchedSettings.gameMode === 'gridShot') {
			let spotFound = false;
			let posX;
			let posY;
			while (!spotFound) {
				const randomX = Math.floor(Math.random() * gridx);
				const randomY = Math.floor(Math.random() * gridy);
				if (!grid[randomX][randomY].targetId) {
					grid[randomX][randomY].targetId = object.id;
					spotFound = true;
				}
				console.log(grid);
			}
			// object.position.x = (Math.random() - 0.5) * ;
			// object.position.y = Math.random() * (params.spread / 2);
			// object.position.z = -10;
		}

		object.position.x = (Math.random() - 0.5) * params.spread;
		object.position.y = Math.random() * (params.spread / 2);
		object.position.z = -Math.random() * (params.spread / 2);

		object.name = 'target';

		scene.add(object);
		updateObjects();
		//if x gamemode
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

	const clearBalls = () => {
		scene.children = scene.children.filter((obj) => obj.name != 'target');
		despawnStack = [];
		updateObjects();
	};

	const getScore = () => {
		accuracy = (hits / (hits + whiffs + misses)) * 100;
		gameInfoClone.score = {
			hits,
			misses,
			whiffs,
			accuracy,
		};
		setGameInfo(gameInfoClone);
		setCurrentScreen('score');
	};

	const endGame = () => {
		clock.stop();
		clearBalls();
		gameInfoClone.started = false;
		getScore();
	};

	const speedTestGame = () => {
		if (
			clock.running &&
			gameInfoClone.spawning &&
			gameInfoClone.timeLeft < gameInfoClone.nextSpawn
		) {
			spawnBall();
			gameInfoClone.nextSpawn = parseFloat(
				gameInfoClone.timeLeft - spawnInterval.toFixed(2)
			);
		}

		if (
			despawnStack.length &&
			gameInfoClone.timeLeft <= despawnStack[0].despawnTime
		)
			despawnBall();

		if (
			accuracy === null &&
			gameInfoClone.timeLeft <= 0 - 1 / params.despawnRate
		)
			endGame();

		if (gameInfoClone.targetsLeft === 0 && gameInfoClone.started) {
			gameInfoClone.spawning = false;
		}
	};

	const initGrid = () => {
		grid = [];
		for (let x = 0; x < gridx; x++) {
			grid[x] = [];
			for (let y = 0; y < gridy; y++) {
				grid[x][y] = { x: x, y: y, targetId: '' };
			}
		}
	};

	const gridShotGame = () => {
		if (!grid) initGrid();

		if (gameInfoClone.timeLeft > 0) spawnBall();
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

	const objectDetection = () => {
		const cameraDirection = new THREE.Vector3();
		const cameraPosition = new THREE.Vector3();
		camera.getWorldDirection(cameraDirection);
		camera.getWorldPosition(cameraPosition);

		raycaster.set(cameraPosition, cameraDirection);

		intersects = raycaster.intersectObjects(objects);

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
	};

	clock.start();

	//game
	const tick = () => {
		// updateObjects();

		//set up game modes here

		elapsedTime =
			clock.getElapsedTime() + gameInfoClone.lastRecordedElapsedTime;

		if (elapsedTime === 0) clearBalls();

		gameInfoClone.timeLeft = parseFloat(
			(params.gameDuration - elapsedTime).toFixed(2)
		);

		// console.log(
		// 	gameInfoClone.timeLeft,
		// 	gameInfoClone.nextSpawn.toFixed(2),
		// 	gameInfoClone.started,
		// 	spawnInterval,
		// 	gameInfoClone.targetsLeft,
		// 	objects.length
		// );

		//speedTest Game Mode
		if (fetchedSettings.gameMode === 'speedTest') speedTestGame();
		//gridShot Game Mode
		else if (fetchedSettings.gameMode === 'gridShot') gridShotGame();

		//object detection
		objectDetection();

		//set hover color
		objects.forEach((obj) => obj.material.color.set(0xff0000));
		intersects.forEach((obj) => obj.object.material.color.set(0x00ff00));

		//update data
		setTime(
			gameInfoClone.timeLeft > 0 ? parseFloat(gameInfoClone.timeLeft) : 0
		);
		// Call tick again on the next frame
		if (clock.running) {
			setGameInfo(gameInfoClone);
			window.requestAnimationFrame(tick);
		}
	};

	tick();
};

export default StartGame;
