export const asyncForEach = async (array, callback): Promise<void> => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

export const waitFor = (ms): Promise<unknown> => new Promise(r => setTimeout(r, ms))
export const delay = (t): Promise<unknown> => new Promise(resolve => setTimeout(resolve, t))
