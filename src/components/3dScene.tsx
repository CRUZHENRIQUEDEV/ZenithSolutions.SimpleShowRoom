import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import * as OBC from "@thatopen/components";

type WorldType = OBC.SimpleWorld<
  OBC.SimpleScene,
  OBC.SimpleCamera,
  OBC.SimpleRenderer
> | null;

export const ThreeDScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [ifcModel, setIfcModel] = useState<THREE.Object3D | null>(null);
  const componentsRef = useRef<OBC.Components | null>(null);
  const worldRef = useRef<WorldType | null>(null);

  useEffect(() => {
    // Initialize components only once
    if (!componentsRef.current) {
      componentsRef.current = new OBC.Components();
      const ifcLoader = componentsRef.current.get(OBC.IfcLoader);
      if (ifcLoader) {
        ifcLoader.settings.wasm = {
          path: "https://unpkg.com/web-ifc@0.0.68/",
          absolute: true,
        };
        ifcLoader.setup();
        console.log("IfcLoader configurado com WASM:", ifcLoader.settings.wasm);
      } else {
        console.error("IfcLoader não foi inicializado corretamente.");
        return;
      }
    }

    const container = containerRef.current;
    if (!container) return;

    // Setup scene only once
    if (!worldRef.current) {
      if (componentsRef.current) {
        const worlds = componentsRef.current.get(OBC.Worlds);
        const world = worlds.create<
          OBC.SimpleScene,
          OBC.SimpleCamera,
          OBC.SimpleRenderer
        >();

        worldRef.current = world;

        if (world) {
          world.scene = new OBC.SimpleScene(componentsRef.current);
          world.renderer = new OBC.SimpleRenderer(
            componentsRef.current,
            container
          );
          world.camera = new OBC.SimpleCamera(componentsRef.current);

          componentsRef.current.init();

          if (world.camera?.controls) {
            world.camera.controls.setLookAt(3, 3, 3, 0, 0, 0);
          }

          const light = new THREE.AmbientLight(0xffffff, 1);
          if (world.scene?.three) {
            world.scene.three.add(light);

            const gridHelper = new THREE.GridHelper(10, 10);
            world.scene.three.add(gridHelper);
          }

          // Initial sizing
          if (world.renderer?.three) {
            const width = container.clientWidth;
            const height = container.clientHeight;
            world.renderer.three.setSize(width, height);

            if (world.camera?.three instanceof THREE.PerspectiveCamera) {
              world.camera.three.aspect = width / height;
              world.camera.three.updateProjectionMatrix();
            } else if (
              world.camera?.three instanceof THREE.OrthographicCamera
            ) {
              const aspect = width / height;
              const frustumHeight = 10;
              const frustumWidth = frustumHeight * aspect;
              world.camera.three.left = frustumWidth / -2;
              world.camera.three.right = frustumWidth / 2;
              world.camera.three.top = frustumHeight / 2;
              world.camera.three.bottom = frustumHeight / -2;
              world.camera.three.updateProjectionMatrix();
            }
          }

          // Animation loop
          function animate() {
            requestAnimationFrame(animate);
            if (
              world.renderer?.three &&
              world.scene?.three &&
              world.camera?.three
            ) {
              world.renderer.three.render(
                world.scene.three,
                world.camera.three
              );
            }
          }
          animate();
        }
      }
    }

    // Listen for IFC file selection event
    const handleIFCFileSelected = (event: CustomEvent<File>) => {
      const file = event.detail;
      if (file) {
        console.log("Arquivo IFC selecionado via evento:", file);
        handleLoadIFC(file);
      }
    };

    // Capture handleResize in this scope for cleanup
    const handleResize = () => {
      if (
        worldRef.current?.renderer?.three &&
        worldRef.current?.camera?.three
      ) {
        const width = container.clientWidth;
        const height = container.clientHeight;
        worldRef.current.renderer.three.setSize(width, height);
        if (worldRef.current.camera.three instanceof THREE.PerspectiveCamera) {
          worldRef.current.camera.three.aspect = width / height;
          worldRef.current.camera.three.updateProjectionMatrix();
        } else if (
          worldRef.current.camera.three instanceof THREE.OrthographicCamera
        ) {
          const aspect = width / height;
          const frustumHeight = 10;
          const frustumWidth = frustumHeight * aspect;
          worldRef.current.camera.three.left = frustumWidth / -2;
          worldRef.current.camera.three.right = frustumWidth / 2;
          worldRef.current.camera.three.top = frustumHeight / 2;
          worldRef.current.camera.three.bottom = frustumHeight / -2;
          worldRef.current.camera.three.updateProjectionMatrix();
        }
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener(
      "ifc-file-selected",
      handleIFCFileSelected as EventListener
    );

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener(
        "ifc-file-selected",
        handleIFCFileSelected as EventListener
      );
    };
  }, []);

  // Effect to handle model changes
  useEffect(() => {
    if (ifcModel && worldRef.current?.scene?.three) {
      // Remove any previous models first
      worldRef.current.scene.three.children =
        worldRef.current.scene.three.children.filter(
          (child: THREE.Object3D) => child.userData.isIFCModel !== true
        );

      // Add new model with identifier
      ifcModel.userData.isIFCModel = true;
      worldRef.current.scene.three.add(ifcModel);
      console.log("Modelo IFC adicionado à cena:", ifcModel);

      // Reset camera to view the new model
      if (worldRef.current.camera?.controls) {
        worldRef.current.camera.controls.setLookAt(5, 5, 5, 0, 0, 0);
        worldRef.current.camera.controls.update(1);
      }
    }
  }, [ifcModel]);

  const handleLoadIFC = async (file: File) => {
    if (!componentsRef.current) {
      console.error("Components não inicializado.");
      return;
    }
    const ifcLoader = componentsRef.current.get(OBC.IfcLoader);
    if (!ifcLoader) {
      console.error("IfcLoader não encontrado nos components.");
      return;
    }
    try {
      console.log("Iniciando o carregamento do IFC...");
      const arrayBuffer = await file.arrayBuffer();
      console.log(
        "Arquivo IFC lido como ArrayBuffer:",
        arrayBuffer.byteLength,
        "bytes"
      );

      // Carrega o modelo IFC usando o ifcLoader
      const fragmentsGroup = await ifcLoader.load(new Uint8Array(arrayBuffer));
      console.log(
        "Arquivo IFC convertido para FragmentsGroup:",
        fragmentsGroup
      );

      // Usa diretamente o fragmentsGroup como modelo 3D
      if (fragmentsGroup) {
        console.log("Grupo de fragmentos obtido:", fragmentsGroup);

        // Center model horizontally but keep bottom at z=0
        const box = new THREE.Box3().setFromObject(fragmentsGroup);
        const center = box.getCenter(new THREE.Vector3());

        // Ajusta apenas X e Y, mantendo Z=0 na base do modelo
        fragmentsGroup.position.x = -center.x;
        fragmentsGroup.position.y = -center.y;
        fragmentsGroup.position.z = -box.min.z * 2; // Coloca a base do modelo em z=0

        setIfcModel(fragmentsGroup);
        console.log("Modelo IFC carregado e estado atualizado.");
      } else {
        console.error("Não foi possível obter fragmentos do grupo.");
      }
    } catch (error) {
      console.error("Erro ao carregar o IFC:", error);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", backgroundColor: "#202020" }}
    />
  );
};
