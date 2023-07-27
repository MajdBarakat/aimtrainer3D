import * as THREE from 'three';
import cloneDeep from 'lodash/cloneDeep';

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

const StartGame = (init, gameInfo, setGameInfo, f) => {
	const { scene, camera, canvas, clock } = init;
	const gameInfoClone = cloneDeep(gameInfo);

	gameInfoClone.targetsLeft =
		gameInfoClone.targetsLeft ||
		Math.floor(params.gameDuration * params.spawnRate);
	gameInfoClone.nextSpawn = gameInfoClone.nextSpawn || params.gameDuration;

	// lastRecordedElapsedTime = gameInfo?.lastElapsedTime || 0;
	// console.log(lastRecordedElapsedTime);

	clock.start();
	//game;

	//raycaster
	const raycaster = new THREE.Raycaster();

	//shooting mechanic
	canvas.addEventListener('click', (e) => {
		if (gameInfoClone.started && currentIntersect) {
			scene.remove(currentIntersect.object);
			objects.splice(
				objects.findIndex(
					(obj) => obj.uuid == currentIntersect.object.uuid
				),
				1
			);
			hits++;
		} else if (gameInfoClone.started && !currentIntersect) whiffs++;
	});

	//animate
	const tick = () => {
		f(gameInfoClone.timeLeft);
		// console.log(clock.running);
		elapsedTime =
			clock.getElapsedTime() + gameInfoClone.lastRecordedElapsedTime;

		gameInfoClone.timeLeft = (params.gameDuration - elapsedTime).toFixed(2);

		const cameraPosition = new THREE.Vector3();
		const cameraDirection = new THREE.Vector3();
		camera.getWorldPosition(cameraPosition);
		camera.getWorldDirection(cameraDirection);

		raycaster.set(cameraPosition, cameraDirection);
		// timer.innerHTML = `${gameInfoClone.timeLeft}`;

		// console.log(
		// 	gameInfoClone.timeLeft,
		// 	gameInfoClone.nextSpawn.toFixed(2),
		// 	gameInfoClone.started,
		// 	spawnInterval,
		// 	gameInfoClone.targetsLeft,
		// 	despawnStack[0]?.despawnTime
		// 	despawnStack
		// );

		//spawn ball
		if (
			gameInfoClone.started &&
			gameInfoClone.timeLeft <= gameInfoClone.nextSpawn.toFixed(2)
		) {
			gameInfoClone.nextSpawn = gameInfoClone.timeLeft - spawnInterval;
			const object = new THREE.Mesh(
				new THREE.SphereGeometry(0.5, 16, 16),
				new THREE.MeshBasicMaterial({ color: '#ff0000' })
			);

			object.position.x = (Math.random() - 0.5) * params.rangeX;
			object.position.y = Math.random() * (params.rangeY / 2);
			object.position.z = -Math.random() * (params.rangeZ / 2);

			scene.add(object);
			objects.push(object);

			const despawnTime = gameInfoClone.timeLeft - 1 / params.despawnRate;
			const despawnObj = {
				uuid: object.uuid,
				despawnTime,
			};
			despawnStack.push(despawnObj);
			gameInfoClone.targetsLeft--;
		}

		// despawn ball
		if (
			despawnStack.length &&
			gameInfoClone.timeLeft <= despawnStack[0].despawnTime
		) {
			const { uuid } = despawnStack[0];
			const index = objects.findIndex((obj) => obj.uuid == uuid);
			// console.log(gameInfoClone.timeLeft, index);
			if (index > -1) {
				scene.remove(objects[index]);
				objects.splice(index, 1);
				misses++;
			}
			despawnStack.shift();
		}

		//end of game
		if (
			accuracy === null &&
			gameInfoClone.timeLeft <= 0 - 1 / params.despawnRate
		) {
			// if (gameInfoClone.timeLeft <= 0) timer.innerHTML = '0.00';
			clock.stop();
			accuracy = (hits / (hits + whiffs + misses)) * 100;
			objects?.forEach((obj) => scene.remove(obj));
			console.log('game over!');
			console.log(`You've hit ${hits} Targets!`);
			console.log(`You've missed ${misses} Targets!`);
			console.log(`You've whiffed ${whiffs} Times!`);
			console.log(`WOW you have an accuracy of ${accuracy}%!`);
			return hits, misses, whiffs;
		}

		if (gameInfoClone.targetsLeft === 0 && gameInfoClone.started) {
			gameInfoClone.started = false;
		}

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
		intersects.forEach((obj) => obj.object.material.color.set(0x00ff00));
		// console.log(gameInfoClone.targetsLeft);

		// Call tick again on the next frame
		if (clock.running) {
			setGameInfo(gameInfoClone);
			window.requestAnimationFrame(tick);
		}
	};

	tick();
};

export default StartGame;
