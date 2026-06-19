import * as THREE from 'three';

export class CinematicCamera {
  readonly camera: THREE.PerspectiveCamera;
  private mouseOffset = new THREE.Vector2();
  private targetOffset = new THREE.Vector2();
  private basePosition = new THREE.Vector3(0, 2.5, 12);
  private lookAtTarget = new THREE.Vector3(0, 1.5, 0);

  constructor() {
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      500
    );
    this.camera.position.copy(this.basePosition);
    this.camera.lookAt(this.lookAtTarget);
  }

  resize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  setMouse(x: number, y: number): void {
    this.targetOffset.set(x * 0.15, y * 0.08);
  }

  update(progress: number, delta: number): void {
    this.mouseOffset.lerp(this.targetOffset, delta * 2);

    const scenePhase = progress * 7;
    const phase = Math.floor(scenePhase);
    const local = scenePhase - phase;

    let x = 0;
    let y = 2.5;
    let z = 12;
    let lookY = 1.5;
    let lookZ = 0;

    switch (phase) {
      case 0: // Dawn
        z = 12 - local * 4;
        y = 2.5 - local * 0.3;
        break;
      case 1: // Preparation
        x = Math.sin(local * Math.PI) * 3;
        z = 8 - local * 2;
        break;
      case 2: // Journey
        x = local * 15 - 5;
        z = 6 + Math.sin(local * Math.PI * 2) * 2;
        y = 3 + Math.sin(local * Math.PI) * 1.5;
        break;
      case 3: // Battlefield
        y = 8 + local * 4;
        z = 15 + local * 5;
        lookY = 0;
        break;
      case 4: // Duel
        x = Math.sin(local * Math.PI * 2) * 5;
        z = 8 + Math.cos(local * Math.PI * 2) * 3;
        y = 2 + Math.sin(local * Math.PI) * 0.5;
        break;
      case 5: // Final Strike
        z = 6 - local * 2;
        y = 2.5 + local * 0.5;
        break;
      case 6: // Ending
        z = 10 + local * 3;
        y = 3;
        lookY = 1;
        break;
    }

    this.basePosition.set(x, y, z);
    this.lookAtTarget.set(x * 0.3, lookY, lookZ);

    this.camera.position.x = this.basePosition.x + this.mouseOffset.x;
    this.camera.position.y = this.basePosition.y + this.mouseOffset.y;
    this.camera.position.z = this.basePosition.z;
    this.camera.lookAt(this.lookAtTarget);
  }
}
