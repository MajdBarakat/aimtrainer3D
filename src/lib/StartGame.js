import * as THREE from 'three';
import _, { random } from 'lodash';
import config from '../config/config.json';

const getValue = (name) => {
	const setting = window.localStorage.getItem(name);
	return setting ? JSON.parse(setting).value : setting;
};

//game variables
let currentIntersect = null;
let elapsedTime = 0;
let objects = [];
let despawnStack = [];
let intersects = [];
let grid;
let lastCell = {};

const StartGame = (
	init,
	gameInfo,
	setGameInfo,
	setTime,
	setCurrentScreen,
	test = false
) => {
	const initParams = () => {
		const params = {};
		config.settingsFormat.forEach(
			(setting) =>
				(params[setting.id] =
					getValue(setting.id) ||
					config.settingsDefaultValues[setting.id])
		);
		return params;
	};

	const params = initParams();
	console.log(params);

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
			new THREE.SphereGeometry(params.targetRadius, 16, 16),
			new THREE.MeshBasicMaterial({ color: '#ff0000' })
		);

		if (params.gameMode === 'gridShot') {
			let cellFound = false;
			let posX;
			let posY;
			while (!cellFound) {
				const randomX = Math.floor(Math.random() * params.gridX);
				const randomY = Math.floor(Math.random() * params.gridY);
				const cell = grid[randomX][randomY];
				if (
					!cell.targetId &&
					randomX !== lastCell.x &&
					randomY !== lastCell.y
				) {
					cell.targetId = object.id;
					cellFound = true;
					posX = cell.x;
					posY = cell.y;
				}
			}
			object.position.x = posX;
			object.position.y = posY;
			object.position.z = 2 - params.gridOffsetZ;
		} else {
			object.position.x = (Math.random() - 0.5) * params.spreadX;

			object.position.y = Math.random() * (params.spreadY / 2);
			object.position.z = 2 - Math.random() * (params.spreadZ / 2);
		}

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

	const resetGame = () => {
		scene.children = scene.children.filter((obj) => obj.name != 'target');
		despawnStack = [];
		grid = null;
		lastCell = {};
		camera.lookAt(0, 0, 0);
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
		resetGame();
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
			((gameInfoClone.targetsLeft === 0 && gameInfoClone.timeLeft <= 0) ||
				gameInfoClone.timeLeft <= 0 - 1 / params.despawnRate)
		)
			endGame();

		if (gameInfoClone.targetsLeft === 0 && gameInfoClone.started) {
			gameInfoClone.spawning = false;
		}
	};

	const initGrid = () => {
		grid = [];
		const radiusAndPaddingMultiplier =
			params.targetRadius * 2 + params.gridPadding;
		console.log(radiusAndPaddingMultiplier);
		const midPointX = (params.gridX - 1) / 2;
		// const midPointY = (params.gridY - 1) / 2;
		for (let x = 0; x < params.gridX; x++) {
			grid[x] = [];
			for (let y = 0; y < params.gridY; y++) {
				grid[x][y] = {
					x: (x - midPointX) * radiusAndPaddingMultiplier,
					y: y * radiusAndPaddingMultiplier,
					targetId: '',
				};
			}
		}
	};

	const gridShotGame = () => {
		if (!grid) initGrid();

		if (
			parseFloat(gameInfoClone.timeLeft) > 0 &&
			objects.length < params.targetCount
		)
			// add custom value for how many balls allowed at a time
			spawnBall();

		if (accuracy === null && gameInfoClone.timeLeft <= 0) endGame();
	};

	//raycaster
	const raycaster = new THREE.Raycaster();

	//shooting mechanic
	canvas.addEventListener('click', (e) => {
		if (gameInfoClone.started && currentIntersect) {
			scene.remove(currentIntersect.object);
			if (params.gameMode === 'gridShot') {
				for (let x = 0; x < grid.length; x++) {
					for (let y = 0; y < grid[x].length; y++) {
						if (
							grid[x][y].targetId === currentIntersect.object.id
						) {
							grid[x][y].targetId = '';
							lastCell.x = x;
							lastCell.y = y;
						}
					}
				}
			}
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

		if (elapsedTime === 0) resetGame();

		gameInfoClone.timeLeft = parseFloat(
			(params.gameDuration - elapsedTime).toFixed(2)
		);

		// console.log(gameInfoClone.timeLeft, objects.length);

		//speedTest Game Mode
		if (params.gameMode === 'speedTest') speedTestGame();
		//gridShot Game Mode
		else if (params.gameMode === 'gridShot') gridShotGame();

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
