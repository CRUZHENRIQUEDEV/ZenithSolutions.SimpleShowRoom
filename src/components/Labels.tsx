// Labels.tsx
import React from 'react'
import * as THREE from 'three'

interface LabelsProps {
  world: { scene: { three: THREE.Scene } }
  positions: THREE.Vector3[]
  label: string
  finalStyles: { textColor: string; labelSize: number }
}

const Labels: React.FC<LabelsProps> = ({ world, positions, label, finalStyles }) => {
  positions.forEach((position) => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (context) {
      canvas.width = 64
      canvas.height = 64
      context.fillStyle = finalStyles.textColor
      context.font = '48px Arial'
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillText(label, 32, 32)

      const texture = new THREE.CanvasTexture(canvas)
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture })
      const sprite = new THREE.Sprite(spriteMaterial)
      sprite.position.copy(position)
      sprite.position.y = 0.3
      sprite.scale.set(finalStyles.labelSize, finalStyles.labelSize, 1)
      world.scene.three.add(sprite)
    }
  })

  return null
}

export default Labels
