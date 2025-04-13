import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import * as OBC from "@thatopen/components";

export const ThreeDScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const components = new OBC.Components();
    const worlds = components.get(OBC.Worlds);
    const world = worlds.create<
      OBC.SimpleScene,
      OBC.SimpleCamera,
      OBC.SimpleRenderer
    >();

    world.scene = new OBC.SimpleScene(components);
    world.renderer = new OBC.SimpleRenderer(components, containerRef.current);
    world.camera = new OBC.SimpleCamera(components);

    components.init();

    if (world.camera.controls) {
      world.camera.controls.setLookAt(3, 3, 3, 0, 0, 0);
    }

    const light = new THREE.AmbientLight(0xffffff, 1);
    world.scene.three.add(light);

    const gridHelper = new THREE.GridHelper(10, 10);
    world.scene.three.add(gridHelper);

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 0.5, 0);
    world.scene.three.add(cube);

    // Safely handle rendering
    function animate() {
      requestAnimationFrame(animate);
      if (
        world?.renderer?.three &&
        world?.scene?.three &&
        world?.camera?.three
      ) {
        world.renderer.three.render(world.scene.three, world.camera.three);
      }
    }
    animate();

    return () => {
      components.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", backgroundColor: "#202020" }}
    />
  );
};
