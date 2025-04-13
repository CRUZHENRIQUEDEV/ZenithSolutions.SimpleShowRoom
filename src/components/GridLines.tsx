// Componente para criar linhas verticais do grid com anéis nas extremidades
import React from 'react';
import * as THREE from 'three';
import { SimpleWorld } from '@thatopen/components'; // Importe o tipo correto para 'world'

interface GridLinesProps {
  world: SimpleWorld; // Garanta que 'world' seja do tipo SimpleWorld ou o tipo correto da sua cena
  x: number; // Posição X da linha vertical
  // Rótulo da linha (opcional)
  startPoint: THREE.Vector3; // Ponto inicial da linha
  endPoint: THREE.Vector3; // Ponto final da linha
  finalStyles: {
    lineColor: string;
    sphereColor: string;
  }; // Estilos visuais (cores)
}

const GridLines: React.FC<GridLinesProps> = ({
  world, // Referência para a cena Three.js
  x, // Posição X da linha vertical
  // Rótulo da linha (não usado neste componente)
  startPoint, // Ponto inicial da linha
  endPoint, // Ponto final da linha
  finalStyles, // Estilos visuais (cores)
}) => {
  // Criação da linha vertical
  const lineGeometry = new THREE.BufferGeometry();
  // Define os pontos da linha usando as coordenadas X fornecidas
  const points = [
    new THREE.Vector3(x, startPoint.y, startPoint.z), // Ponto inferior
    new THREE.Vector3(x, endPoint.y, endPoint.z), // Ponto superior
  ];
  lineGeometry.setFromPoints(points);
  // Material da linha com cor definida nos estilos
  const lineMaterial = new THREE.LineBasicMaterial({
    color: new THREE.Color(finalStyles.lineColor),
  });
  // Cria e adiciona a linha à cena
  const line = new THREE.Line(lineGeometry, lineMaterial);
  world.scene.three.add(line);

  // Criação dos anéis nas extremidades
  // Geometria do anel com raio interno 0.1 e externo 0.3
  const ringGeometry = new THREE.RingGeometry(0.1, 0.3, 64); // 64 segmentos para suavidade
  // Material do anel com renderização dos dois lados
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(finalStyles.sphereColor),
    side: THREE.DoubleSide, // Renderiza ambos os lados do anel
  });

  // Anel superior
  const topRing = new THREE.Mesh(ringGeometry, ringMaterial);
  topRing.position.set(x, endPoint.y, endPoint.z); // Posiciona no ponto superior
  topRing.rotation.x = -Math.PI / 2; // Rotaciona para ficar paralelo ao chão
  world.scene.three.add(topRing);

  // Anel inferior
  const bottomRing = new THREE.Mesh(ringGeometry, ringMaterial);
  bottomRing.position.set(x, startPoint.y, startPoint.z); // Posiciona no ponto inferior
  bottomRing.rotation.x = -Math.PI / 2; // Rotaciona para ficar paralelo ao chão
  world.scene.three.add(bottomRing);

  // Componente não renderiza nada no DOM do React
  return null;
};

export default GridLines;