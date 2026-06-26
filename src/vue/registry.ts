import type { Component } from 'vue'

const registry = new Map<string, Component>()

export function registerNodeRenderer(type: string, component: Component): void {
  registry.set(type, component)
}

export function resolveNodeRenderer(type: string): Component | undefined {
  return registry.get(type)
}
