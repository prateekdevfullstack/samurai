import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export type AssetMap = Map<string, THREE.Object3D | THREE.Texture>;

export class AssetLoader {
  private gltfLoader = new GLTFLoader();
  private textureLoader = new THREE.TextureLoader();
  private cache: AssetMap = new Map();
  private loading = false;
  private loaded = false;

  async loadAll(): Promise<AssetMap> {
    if (this.loaded) return this.cache;
    if (this.loading) {
      return new Promise((resolve) => {
        const check = () => {
          if (this.loaded) resolve(this.cache);
          else requestAnimationFrame(check);
        };
        check();
      });
    }

    this.loading = true;

    const assetPaths: { key: string; path: string; type: 'gltf' | 'texture' }[] = [
      { key: 'katana', path: '/assets/katana.glb', type: 'gltf' },
      { key: 'samurai', path: '/assets/samurai.glb', type: 'gltf' },
      { key: 'battlefield', path: '/assets/battlefield.glb', type: 'gltf' },
      { key: 'temple', path: '/assets/temple.glb', type: 'gltf' },
    ];

    const promises = assetPaths.map(async ({ key, path, type }) => {
      try {
        if (type === 'gltf') {
          const gltf = await this.gltfLoader.loadAsync(path);
          this.cache.set(key, gltf.scene);
        } else {
          const tex = await this.textureLoader.loadAsync(path);
          this.cache.set(key, tex);
        }
      } catch {
        // Procedural fallbacks are used when assets are missing
      }
    });

    await Promise.allSettled(promises);
    this.loading = false;
    this.loaded = true;
    return this.cache;
  }

  get(key: string): THREE.Object3D | THREE.Texture | undefined {
    return this.cache.get(key);
  }

  cloneModel(key: string): THREE.Object3D | null {
    const asset = this.cache.get(key);
    if (asset && asset instanceof THREE.Object3D) {
      return asset.clone();
    }
    return null;
  }
}
