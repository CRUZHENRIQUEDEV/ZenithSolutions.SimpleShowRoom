import React, { useEffect, useRef, useState, useCallback } from "react";
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

  // Função para configurar iluminação avançada
  const setupLighting = useCallback((scene: THREE.Scene) => {
    // Luz ambiente mais forte para reduzir áreas escuras
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    // Luz direcional principal (simula o sol) - sem sombras
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    scene.add(directionalLight);

    // Luz de preenchimento mais forte (fill light)
    const fillLight = new THREE.DirectionalLight(0x87ceeb, 0.5);
    fillLight.position.set(-30, 20, -30);
    scene.add(fillLight);

    // Segunda luz de preenchimento do lado oposto
    const fillLight2 = new THREE.DirectionalLight(0xffeaa7, 0.4);
    fillLight2.position.set(30, 20, -30);
    scene.add(fillLight2);

    // Luz de baixo para reduzir sombras muito escuras
    const bottomLight = new THREE.DirectionalLight(0x74b9ff, 0.3);
    bottomLight.position.set(0, -20, 0);
    scene.add(bottomLight);
  }, []);

  // Função para melhorar materiais
  const enhanceMaterial = useCallback(
    (material: THREE.MeshStandardMaterial) => {
      material.roughness = 0.5;
      material.metalness = 0.02;

      // Adicionar variação de cor para materiais muito uniformes
      const hsl = { h: 0, s: 0, l: 0 };
      material.color.getHSL(hsl);

      // Tornar cores mais claras e com mais contraste para melhor visibilidade
      hsl.l = Math.max(0.5, Math.min(0.9, hsl.l + 0.3));

      // Aumentar a saturação para criar mais diferenciação visual
      if (hsl.s < 0.2) {
        // Variar o matiz para criar diferenciação entre elementos
        hsl.h += (Math.random() - 0.5) * 0.2;
        hsl.s = Math.max(0.2, hsl.s + 0.25);
      }

      material.color.setHSL(hsl.h, hsl.s, hsl.l);

      // Adicionar um pouco de emissive para destacar mais
      const emissiveColor = material.color.clone();
      emissiveColor.multiplyScalar(0.05);
      material.emissive = emissiveColor;
    },
    []
  );

  // Função para melhorar materiais (sem wireframes)
  const enhanceModelVisibility = useCallback(
    (model: THREE.Object3D) => {
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Remover qualquer geometria de helper/debug que possa estar criando caixas
          if (
            child.userData.isHelper ||
            child.userData.isBoundingBox ||
            (child.material instanceof THREE.MeshBasicMaterial &&
              child.material.transparent &&
              child.material.opacity < 0.5)
          ) {
            child.visible = false;
            return;
          }

          // Se o material é muito uniforme, vamos melhorá-lo
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => {
                if (mat instanceof THREE.MeshStandardMaterial) {
                  enhanceMaterial(mat);
                }
              });
            } else if (child.material instanceof THREE.MeshStandardMaterial) {
              enhanceMaterial(child.material);
            }
          }

          // REMOVIDO: wireframes que estavam criando caixas fantasmas
        }

        // Remover qualquer objeto suspeito que possa ser um helper/debug
        if (
          child.type === "BoxHelper" ||
          child.type === "Box3Helper" ||
          child.name.includes("helper") ||
          child.name.includes("bbox") ||
          child.name.includes("bound")
        ) {
          child.visible = false;
        }
      });
    },
    [enhanceMaterial]
  );

  // Função para configurar o renderer
  const setupRenderer = useCallback((renderer: THREE.WebGLRenderer) => {
    // Desabilitar sombras temporariamente para eliminar caixas transparentes
    renderer.shadowMap.enabled = false;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.setClearColor(0x263238, 1);
  }, []);

  // Função para configurar a cena
  const setupScene = useCallback(
    (scene: THREE.Scene) => {
      setupLighting(scene);

      // Grid mais sutil e sem receber sombras
      const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
      scene.add(gridHelper);
    },
    [setupLighting]
  );

  // Função para redimensionamento da câmera
  const updateCameraSize = useCallback((container: HTMLDivElement) => {
    if (worldRef.current?.renderer?.three && worldRef.current?.camera?.three) {
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
  }, []);

  // Inicialização dos componentes
  const initializeComponents = useCallback(() => {
    if (componentsRef.current) return componentsRef.current;

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
    }

    return componentsRef.current;
  }, []);

  // Configuração do mundo 3D
  const setupWorld = useCallback(
    (container: HTMLDivElement) => {
      if (worldRef.current) return worldRef.current;

      const components = initializeComponents();
      if (!components) return null;

      const worlds = components.get(OBC.Worlds);
      const world = worlds.create<
        OBC.SimpleScene,
        OBC.SimpleCamera,
        OBC.SimpleRenderer
      >();

      worldRef.current = world;

      if (world) {
        world.scene = new OBC.SimpleScene(components);
        world.renderer = new OBC.SimpleRenderer(components, container);
        world.camera = new OBC.SimpleCamera(components);

        components.init();

        if (world.renderer?.three) {
          setupRenderer(world.renderer.three);
        }

        if (world.camera?.controls) {
          world.camera.controls.setLookAt(15, 15, 15, 0, 0, 0);
        }

        if (world.scene?.three) {
          setupScene(world.scene.three);
        }

        updateCameraSize(container);

        console.log("Cena, câmera e renderizador configurados.");

        // Animation loop
        function animate() {
          requestAnimationFrame(animate);

          if (
            world.renderer?.three &&
            world.scene?.three &&
            world.camera?.three
          ) {
            world.renderer.three.render(world.scene.three, world.camera.three);
          }
        }
        animate();
      }

      return world;
    },
    [initializeComponents, setupRenderer, setupScene, updateCameraSize]
  );

  const handleLoadIFC = useCallback(async (file: File) => {
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
        fragmentsGroup.position.z = -box.min.z; // Coloca a base do modelo em z=0

        setIfcModel(fragmentsGroup);
        console.log("Modelo IFC carregado e estado atualizado.");
      } else {
        console.error("Não foi possível obter fragmentos do grupo.");
      }
    } catch (error) {
      console.error("Erro ao carregar o IFC:", error);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    setupWorld(container);

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
      updateCameraSize(container);
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
  }, [setupWorld, handleLoadIFC, updateCameraSize]);

  // Effect to handle model changes
  useEffect(() => {
    if (ifcModel && worldRef.current?.scene?.three) {
      // Remove any previous models first
      worldRef.current.scene.three.children =
        worldRef.current.scene.three.children.filter(
          (child: THREE.Object3D) => child.userData.isIFCModel !== true
        );

      // Limpar qualquer helper/debug geometry que possa estar criando caixas
      worldRef.current.scene.three.traverse((child) => {
        if (
          child.type === "BoxHelper" ||
          child.type === "Box3Helper" ||
          child.type === "LineSegments" || // Remove wireframes existentes
          child.name.includes("helper") ||
          child.name.includes("bbox") ||
          child.name.includes("bound") ||
          child.userData.isWireframe || // Remove nossos wireframes
          (child instanceof THREE.Mesh &&
            child.material instanceof THREE.MeshBasicMaterial &&
            child.material.transparent &&
            child.material.opacity < 0.5)
        ) {
          child.visible = false;
          if (child.parent) {
            child.parent.remove(child);
          }
        }
      });

      // Melhorar a visibilidade do modelo antes de adicionar
      enhanceModelVisibility(ifcModel);

      // Add new model with identifier
      ifcModel.userData.isIFCModel = true;
      worldRef.current.scene.three.add(ifcModel);
      console.log("Modelo IFC adicionado à cena:", ifcModel);

      // Calcular bounding box para ajustar câmera dinamicamente
      const box = new THREE.Box3().setFromObject(ifcModel);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const distance = maxDim * 1.5;

      // Reset camera to view the new model
      if (worldRef.current.camera?.controls) {
        const center = box.getCenter(new THREE.Vector3());
        worldRef.current.camera.controls.setLookAt(
          center.x + distance * 0.7,
          center.y + distance * 0.7,
          center.z + distance * 0.7,
          center.x,
          center.y,
          center.z
        );
      }
    }
  }, [ifcModel, enhanceModelVisibility]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#263238",
        position: "relative",
      }}
    >
      {/* Controles de visualização opcionais */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "rgba(0,0,0,0.7)",
          color: "white",
          padding: "8px",
          borderRadius: "4px",
          fontSize: "12px",
          zIndex: 1000,
        }}
      >
        <div>Mouse: Rotate | Wheel: Zoom | Right-click: Pan</div>
      </div>
    </div>
  );
};

export default ThreeDScene;
