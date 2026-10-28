/** The name React DevTools shows for a component, as used in wrapper names like `Skeleton(Name)`. */
export function getDisplayName(Component: { displayName?: string; name: string }): string {
  return Component.displayName || Component.name || 'Component'
}
