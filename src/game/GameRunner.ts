import * as THREE from 'three';
import { CharacterModel } from './Character';
import { WorldManager } from './WorldObjects';
import { DifficultyLevel, GameStats } from '../types';
import { DIFFICULTY_CONFIGS } from '../data/difficulties';
import { sound } from '../utils/audio';

export interface GameRunnerCallbacks {
  onStatsUpdate: (stats: GameStats) => void;
  onSpeedUp: (newSpeed: number, level: number) => void;
  onGameOver: (finalStats: GameStats) => void;
  onGoldCollect: (totalGold: number) => void;
}

export class GameRunner {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private character: CharacterModel;
  private world: WorldManager;
  private dirLight: THREE.DirectionalLight;
  private ambientLight: THREE.AmbientLight;

  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private difficulty: DifficultyLevel = 1;
  private callbacks: GameRunnerCallbacks;

  // Player state
  private playerX: number = 0;
  private targetPlayerX: number = 0;
  private playerZ: number = 0;
  private playerY: number = 0;
  private jumpVelocity: number = 0;
  private isJumping: boolean = false;

  // Physics constants
  private readonly JUMP_FORCE = 15.5;
  private readonly GRAVITY = 38.0;
  private readonly TRACK_WIDTH = 7.6; // Boundaries: -3.8 to +3.8
  private readonly LERP_FACTOR = 11.0; // Smooth mouse following factor

  // Game stats
  private currentSpeed: number = 18;
  private distance: number = 0;
  private goldCount: number = 0;
  private elapsedTime: number = 0;
  private lastSpeedUpTime: number = 0;
  private speedLevel: number = 1;

  // Animation frame
  private animationFrameId: number | null = null;
  private lastTime: number = 0;

  // Camera shake on hit
  private shakeIntensity: number = 0;

  constructor(container: HTMLElement, callbacks: GameRunnerCallbacks) {
    this.container = container;
    this.callbacks = callbacks;

    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a); // Deep modern slate sky
    this.scene.fog = new THREE.Fog(0x0f172a, 45, 140);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 200);

    // 2. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // 3. Lighting
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xffffff, 1.3);
    this.dirLight.position.set(10, 20, -10);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 60;
    const d = 15;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.scene.add(this.dirLight);
    this.scene.add(this.dirLight.target);

    // 4. Character & World
    this.character = new CharacterModel();
    this.scene.add(this.character.group);

    this.world = new WorldManager(this.scene);

    // 5. Input Bindings
    this.setupInputs();
  }

  private setupInputs() {
    // Smooth mouse X positioning
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!this.isRunning || this.isPaused) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const rect = this.container.getBoundingClientRect();
      const normX = (clientX - rect.left) / rect.width; // 0 (left) to 1 (right)
      const clampedNormX = Math.max(0.05, Math.min(0.95, normX));

      // Continuous smooth target X based on mouse coordinate (inverted for camera perspective looking down +Z)
      this.targetPlayerX = (0.5 - clampedNormX) * this.TRACK_WIDTH;
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove, { passive: true });

    // Screen click triggers jump (User explicitly requested: 화면 아무데나 클릭하면 점프할 수 있게)
    const handleJumpTrigger = (e: MouseEvent | TouchEvent) => {
      // Don't trigger jump if user clicked an interactive modal/button
      const target = e.target as HTMLElement;
      if (target && target.closest('button, a, input, select')) {
        return;
      }
      this.jump();
    };

    this.container.addEventListener('pointerdown', handleJumpTrigger);

    // Spacebar or ArrowUp fallback
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        this.jump();
      }
    });
  }

  public jump() {
    if (!this.isRunning || this.isPaused) return;

    if (!this.isJumping && this.playerY <= 0.05) {
      this.isJumping = true;
      this.jumpVelocity = this.JUMP_FORCE;
      sound.playJump();
    }
  }

  public start(difficulty: DifficultyLevel) {
    this.difficulty = difficulty;
    const config = DIFFICULTY_CONFIGS[difficulty];

    this.currentSpeed = config.initialSpeed;
    this.distance = 0;
    this.goldCount = 0;
    this.elapsedTime = 0;
    this.lastSpeedUpTime = 0;
    this.speedLevel = 1;

    this.playerX = 0;
    this.targetPlayerX = 0;
    this.playerZ = 0;
    this.playerY = 0;
    this.jumpVelocity = 0;
    this.isJumping = false;
    this.shakeIntensity = 0;

    this.character.group.position.set(0, 0, 0);
    this.character.group.rotation.set(0, 0, 0);

    this.world.reset(0);

    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.loop(this.lastTime);
  }

  public pause() {
    this.isPaused = true;
  }

  public resume() {
    if (!this.isRunning) return;
    this.isPaused = false;
    this.lastTime = performance.now();
  }

  public setDifficulty(level: DifficultyLevel) {
    this.difficulty = level;
  }

  public resize(width: number, height: number) {
    if (!this.renderer || !this.camera) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private loop = (time: number) => {
    this.animationFrameId = requestAnimationFrame(this.loop);

    if (!this.isRunning || this.isPaused) {
      this.renderer.render(this.scene, this.camera);
      return;
    }

    const delta = Math.min((time - this.lastTime) / 1000, 0.05); // cap delta for stability
    this.lastTime = time;

    this.update(delta);
    this.renderer.render(this.scene, this.camera);
  };

  private update(delta: number) {
    const config = DIFFICULTY_CONFIGS[this.difficulty];

    // 1. Time & Speed handling
    // "일정한 시간이 지나면 1단계를 뺀 모든 단계는 속도가 조금씩 빨라지게 해줘"
    this.elapsedTime += delta;
    if (config.speedIncrement > 0 && this.currentSpeed < config.maxSpeed) {
      if (this.elapsedTime - this.lastSpeedUpTime >= config.speedUpInterval) {
        this.lastSpeedUpTime = this.elapsedTime;
        this.currentSpeed = Math.min(config.maxSpeed, this.currentSpeed + config.speedIncrement);
        this.speedLevel++;
        sound.playSpeedUp();
        this.callbacks.onSpeedUp(this.currentSpeed, this.speedLevel);
      }
    }

    // 2. Movement along Z axis (running forward)
    const forwardStep = this.currentSpeed * delta;
    this.playerZ += forwardStep;
    this.distance += forwardStep;

    // 3. Smooth mouse X interpolation (no discrete lane snapping)
    // 캐릭터가 마우스 엑스좌표에 따라 부드럽게 이동
    this.playerX += (this.targetPlayerX - this.playerX) * Math.min(1.0, this.LERP_FACTOR * delta);
    this.playerX = Math.max(-this.TRACK_WIDTH / 2, Math.min(this.TRACK_WIDTH / 2, this.playerX));

    // Natural banking lean when steering
    const steerDelta = this.targetPlayerX - this.playerX;
    const targetRoll = -steerDelta * 0.18;
    this.character.group.rotation.z += (targetRoll - this.character.group.rotation.z) * 10 * delta;

    // 4. Jump physics
    if (this.isJumping || this.playerY > 0) {
      this.jumpVelocity -= this.GRAVITY * delta;
      this.playerY += this.jumpVelocity * delta;

      if (this.playerY <= 0) {
        this.playerY = 0;
        this.jumpVelocity = 0;
        this.isJumping = false;
      }
    }

    // Update character mesh coordinates
    this.character.group.position.set(this.playerX, this.playerY, this.playerZ);
    this.character.animate(delta, this.currentSpeed, this.isJumping);

    // 5. Update track, objects & particles
    this.world.updateTrack(this.playerZ);
    this.world.spawnWorldObjects(this.playerZ, this.difficulty);
    this.world.update(delta, this.playerZ);

    // 6. Camera following & dynamic light
    let shakeX = 0;
    let shakeY = 0;
    if (this.shakeIntensity > 0) {
      shakeX = (Math.random() - 0.5) * this.shakeIntensity;
      shakeY = (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeIntensity = Math.max(0, this.shakeIntensity - delta * 4);
    }

    this.camera.position.set(
      this.playerX * 0.35 + shakeX,
      this.playerY * 0.25 + 4.2 + shakeY,
      this.playerZ - 7.5
    );
    this.camera.lookAt(
      this.playerX * 0.3,
      this.playerY * 0.2 + 1.8,
      this.playerZ + 12
    );

    // Move directional light with player
    this.dirLight.position.set(this.playerX + 10, 20, this.playerZ - 10);
    this.dirLight.target.position.set(this.playerX, 0, this.playerZ + 10);

    // 7. Check gold pickup collisions
    this.checkGoldCollisions();

    // 8. Check obstacle collisions
    if (this.checkObstacleCollisions()) {
      this.handleGameOver();
      return;
    }

    // 9. Emit stats
    const totalScore = Math.floor(this.distance + this.goldCount * 50 * this.difficulty);
    this.callbacks.onStatsUpdate({
      score: totalScore,
      distance: Math.floor(this.distance),
      gold: this.goldCount,
      speed: Math.round(this.currentSpeed * 10) / 10,
      timeAlive: Math.floor(this.elapsedTime),
      speedLevel: this.speedLevel,
    });
  }

  private checkGoldCollisions() {
    const playerBox = new THREE.Box3();
    playerBox.setFromCenterAndSize(
      new THREE.Vector3(this.playerX, this.playerY + 0.8, this.playerZ),
      new THREE.Vector3(1.1, 1.6, 1.1)
    );

    for (const gold of this.world.goldItems) {
      if (!gold.collected && playerBox.intersectsBox(gold.box)) {
        gold.collected = true;
        this.goldCount++;
        sound.playCoin();
        this.world.burstParticles(gold.mesh.position.x, gold.mesh.position.y, gold.mesh.position.z, 20);
        this.callbacks.onGoldCollect(this.goldCount);
      }
    }
  }

  private checkObstacleCollisions(): boolean {
    const playerBox = new THREE.Box3();
    playerBox.setFromCenterAndSize(
      new THREE.Vector3(this.playerX, this.playerY + 0.8, this.playerZ),
      new THREE.Vector3(0.65, 1.6, 0.65)
    );

    for (const obs of this.world.obstacles) {
      // Check collision only when in close Z proximity
      if (Math.abs(obs.z - this.playerZ) < 2.5) {
        if (playerBox.intersectsBox(obs.box)) {
          // If obstacle is jumpable (e.g. low hurdle or cone)
          if (obs.jumpable) {
            // Player's feet must clear hurdle height (obs.height)
            if (this.playerY >= obs.height - 0.2) {
              // Successfully cleared the jump!
              continue;
            }
          }
          // Collision occurred!
          return true;
        }
      }
    }
    return false;
  }

  private handleGameOver() {
    this.isRunning = false;
    this.shakeIntensity = 1.2;
    sound.playHit();

    // Ragdoll spin effect
    this.character.group.rotation.x = -Math.PI / 2;
    this.character.group.position.y = 0.3;

    const totalScore = Math.floor(this.distance + this.goldCount * 50 * this.difficulty);
    const finalStats: GameStats = {
      score: totalScore,
      distance: Math.floor(this.distance),
      gold: this.goldCount,
      speed: Math.round(this.currentSpeed * 10) / 10,
      timeAlive: Math.floor(this.elapsedTime),
      speedLevel: this.speedLevel,
    };

    setTimeout(() => {
      this.callbacks.onGameOver(finalStats);
    }, 450);
  }

  public destroy() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
