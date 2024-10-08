function imagePath(path: string, version = 0, ext = 'png'): string {
  const qs = version ? `?v=${version}` : ''
  return `${path}.${ext}${qs}`
}

export const ImageLibrary = {
  SlotActive: imagePath('tile/craft/slot_active', 1),
  SlotInactive: imagePath('tile/craft/slot', 1),
  BackpackIcon: imagePath('tile/craft/backpack'),
  BackgroundPaw: imagePath('backgrounds/paw'),
}
