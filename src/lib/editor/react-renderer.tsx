import { createRoot, type Root } from 'react-dom/client'
import type { ReactNode } from 'react'

export class ReactRenderer {
  private root: Root
  readonly element: HTMLElement
  constructor(component: ReactNode) { this.element = document.createElement('span'); this.root = createRoot(this.element); this.root.render(component) }
  destroy() { this.root.unmount(); this.element.remove() }
}