import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import * as OBC from "@thatopen/components";

interface Props {
  gridCount?: number;
  spacing?: number;
  gridLength?: number;
}

export default function Hybrid3DScene({
  gridCount = 3,
  spacing = 100,
  gridLength = 200,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const components = new OBC.Components();
    const worlds = components.get(OBC.Worlds);
    const world = worlds.create<
      OBC.SimpleScene,
      OBC.SimpleCamera,
      OBC.SimpleRenderer
    >();

    world.scene = new OBC.SimpleScene(components);
    world.renderer = new OBC.SimpleRenderer(components, container);
    world.camera = new OBC.SimpleCamera(components);

    components.init();

    if (world.camera.controls) {
      world.camera.controls.setLookAt(3, 3, 3, 0, 0, 0);
    }

    const light = new THREE.AmbientLight(0xffffff, 1);
    world.scene.three.add(light);

    const gridHelper = new THREE.GridHelper(10, 10);
    world.scene.three.add(gridHelper);

    const createVerticalGrid = (x: number, label: string) => {
      const lineGeometry = new THREE.BufferGeometry();
      const startZ = -gridLength / 2;
      const endZ = gridLength / 2;
      const points = [
        new THREE.Vector3(x, 0, startZ),
        new THREE.Vector3(x, 0, endZ),
      ];
      lineGeometry.setFromPoints(points);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
      const line = new THREE.Line(lineGeometry, lineMaterial);
      world.scene.three.add(line);

      // Create white spheres at endpoints
      const sphereGeometry = new THREE.SphereGeometry(0.2, 32, 32);
      const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

      const topSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      topSphere.position.set(x, 0, endZ);
      world.scene.three.add(topSphere);

      const bottomSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      bottomSphere.position.set(x, 0, startZ);
      world.scene.three.add(bottomSphere);

      // Add dimension lines between grids
      if (x > 0) {
        const prevX = x - spacing / 100;
        const dimensionGeometry = new THREE.BufferGeometry();
        const dimensionPoints = [
          new THREE.Vector3(prevX, 0, startZ - 0.5),
          new THREE.Vector3(x, 0, startZ - 0.5),
        ];
        dimensionGeometry.setFromPoints(dimensionPoints);
        const dimensionMaterial = new THREE.LineBasicMaterial({
          color: 0xffffff,
        });
        const dimensionLine = new THREE.Line(
          dimensionGeometry,
          dimensionMaterial
        );
        world.scene.three.add(dimensionLine);

        // Add dimension text
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (context) {
          canvas.width = 128;
          canvas.height = 32;
          context.fillStyle = "white";
          context.font = "24px Arial";
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillText(`${spacing}mm`, 64, 16);

          const texture = new THREE.CanvasTexture(canvas);
          const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
          const sprite = new THREE.Sprite(spriteMaterial);
          sprite.position.set((prevX + x) / 2, 0.3, startZ - 0.5);
          sprite.scale.set(1, 0.25, 1);
          world.scene.three.add(sprite);
        }
      }

      // Add grid labels
      const createLabel = (position: THREE.Vector3, text: string) => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (context) {
          canvas.width = 64;
          canvas.height = 64;
          context.fillStyle = "white";
          context.font = "48px Arial";
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillText(text, 32, 32);

          const texture = new THREE.CanvasTexture(canvas);
          const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
          const sprite = new THREE.Sprite(spriteMaterial);
          sprite.position.copy(position);
          sprite.position.y = 0.3;
          sprite.scale.set(0.5, 0.5, 1);
          world.scene.three.add(sprite);
        }
      };

      createLabel(new THREE.Vector3(x, 0, endZ), label);
      createLabel(new THREE.Vector3(x, 0, startZ), label);
    };

    const startX = 0;
    for (let i = 0; i < gridCount; i++) {
      createVerticalGrid(startX + (i * spacing) / 100, (i + 1).toString());
    }

    const handleResize = () => {
      if (world?.renderer?.three && world?.camera?.three) {
        const width = container.clientWidth;
        const height = container.clientHeight;
        world.renderer.three.setSize(width, height);

        // Verifica se a câmera é uma PerspectiveCamera antes de acessar 'aspect'
        if (world.camera.three instanceof THREE.PerspectiveCamera) {
          world.camera.three.aspect = width / height;
          world.camera.three.updateProjectionMatrix();
        } else if (world.camera.three instanceof THREE.OrthographicCamera) {
          // Para OrthographicCamera, você precisará ajustar 'left', 'right', 'top', 'bottom'
          // e chamar 'updateProjectionMatrix'. A lógica exata depende da sua necessidade.
          const aspect = width / height;
          const frustumHeight = 10; // Ajuste conforme necessário
          const frustumWidth = frustumHeight * aspect;
          world.camera.three.left = frustumWidth / -2;
          world.camera.three.right = frustumWidth / 2;
          world.camera.three.top = frustumHeight / 2;
          world.camera.three.bottom = frustumHeight / -2;
          world.camera.three.updateProjectionMatrix();
        }
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Chamar na inicialização para definir o tamanho inicial

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
      window.removeEventListener("resize", handleResize);
      components.dispose();
    };
  }, [gridCount, spacing, gridLength]);

  return (
    <div className="three-d-container">
      <div ref={containerRef} className="three-d-viewport" />
    </div>
  );
}
