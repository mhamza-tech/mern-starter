export function UnrealArrayParamDecoratorMixin(metadata: Symbol) {
  return function UnrealArrayParamDecorator() {
    return function UnrealArrayParamDecorator(target: Object, metaPropertyKey: string | symbol, parameterIndex: number): void {
      Reflect.defineMetadata(metadata, [
        ...Reflect.getMetadata(metadata, target, metaPropertyKey) || [],
        parameterIndex,
      ], target, metaPropertyKey)
    }
  }
}

export function UnrealArrayParamDecoratorMixinUnwrap<T>(metadata: Symbol, target: Object, metaPropertyKey: string | symbol, val: T): Record<string, T> {
  const existingArgIndices = (Reflect.getMetadata(metadata, target, metaPropertyKey) || []) as number[]

  return existingArgIndices.reduce((acc, key) => ({ ...acc, [key]: val }), {})
}
