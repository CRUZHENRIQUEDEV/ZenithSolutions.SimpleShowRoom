// Componente para criar linhas de dimensão com texto na cena 3D
import React from 'react'
import * as THREE from 'three'

// Interface que define as props necessárias para o componente
interface DimensionLinesProps {
  world: { scene: { three: THREE.Scene } }  // Referência para a cena Three.js
  startPoint: THREE.Vector3                 // Ponto inicial da linha de dimensão
  endPoint: THREE.Vector3                   // Ponto final da linha de dimensão
  finalStyles: { lineColor: string; textColor: string } // Cores para linha e texto
}

const DimensionLines: React.FC<DimensionLinesProps> = ({
  world,
  startPoint,
  endPoint,
  finalStyles
}) => {
  // Cria a geometria para a linha de dimensão usando BufferGeometry
  const dimensionGeometry = new THREE.BufferGeometry()

  // Cria um offset para deslocar a linha ligeiramente para trás (eixo Z)
  const offset = new THREE.Vector3(0, 0, -0.5)

  // Clona os pontos e adiciona o offset para não modificar os pontos originais
  const point1 = startPoint.clone().add(offset)
  const point2 = endPoint.clone().add(offset)

  // Array com os pontos que formam a linha
  const dimensionPoints = [point1, point2]

  // Define os pontos na geometria
  dimensionGeometry.setFromPoints(dimensionPoints)

  // Cria o material para a linha com a cor especificada
  const dimensionMaterial = new THREE.LineBasicMaterial({
    color: new THREE.Color(finalStyles.lineColor)
  })

  // Cria a linha usando a geometria e o material
  const dimensionLine = new THREE.Line(dimensionGeometry, dimensionMaterial)

  // Adiciona a linha à cena
  world.scene.three.add(dimensionLine)

  // Criação do texto da dimensão usando canvas 2D
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (context) {
    // Configura o canvas para o texto
    canvas.width = 200
    canvas.height = 32
    context.fillStyle = finalStyles.textColor
    context.font = '25px Arial'
    context.textAlign = 'center'
    context.textBaseline = 'middle'

    // Calcula a distância entre os pontos e converte para milímetros
    const distance = startPoint.distanceTo(endPoint) * 100

    // Renderiza o texto com a distância no canvas
    context.fillText(`${distance.toFixed(2)}mm`, 32, 16)

    // Cria uma textura a partir do canvas
    const texture = new THREE.CanvasTexture(canvas)

    // Cria um material para o sprite usando a textura
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture })

    // Cria o sprite que exibirá o texto
    const sprite = new THREE.Sprite(spriteMaterial)

    // Calcula o ponto médio entre os pontos da linha
    const midPoint = new THREE.Vector3()
    midPoint.addVectors(point1, point2).multiplyScalar(0.5)
    // Eleva ligeiramente o texto acima da linha
    midPoint.y += 0.3

    // Posiciona o sprite no ponto médio
    sprite.position.copy(midPoint)
    // Define a escala do sprite para ajustar o tamanho do texto
    sprite.scale.set(1, 0.25, 1)
    // Adiciona o sprite à cena
    world.scene.three.add(sprite)
  }

  // O componente não renderiza nada no DOM do React
  return null
}

export default DimensionLines