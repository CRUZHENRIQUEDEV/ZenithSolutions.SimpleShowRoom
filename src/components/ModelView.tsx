import React, { useEffect, useRef } from "react";
import * as OBC from "@thatopen/components";

export const ModelView: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Inicializar os componentes
    const components = new OBC.Components();
    const worlds = components.get(OBC.Worlds);
    const world = worlds.create();

    // Configuração do mundo
    world.scene = new OBC.SimpleScene(components);
    world.renderer = new OBC.SimpleRenderer(components, containerRef.current);
    world.camera = new OBC.SimpleCamera(components);

    // Inicializar o ambiente
    components.init();
    // world.camera.controls.setLookAt(3, 3, 3, 0, 0, 0);

    // Cleanup ao desmontar o componente
    return () => {
      components.dispose();
    };
  }, []);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
};
