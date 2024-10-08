// export const increment = (contextApi: ChatRoomActionContextApi, args: any): Promise<number> => {
//     const actionCounter = actionCounterName(args.input.name)
//     return contextApi
//         .getActor()
//         .incrementLocalState(actionCounter, 1)
//         .then((saveFieldOutput: SaveFieldOutput) => _.get(saveFieldOutput.field, 'metadata.numberValue') as number)
// }

// export const getActionCount = async (contextApi: ChatRoomActionContextApi, actionName: string): Promise<number> => {
//     const actionCounter = actionCounterName(actionName)
//     const setLocalStateInput: SetLocalStateInput = {
//         type: FieldType.NumberField,
//         name: actionCounter,
//         metadata: {
//             numberValue: 0,
//         },
//     }

//     return await contextApi
//         .getActor()
//         .getLocalState(actionCounter, setLocalStateInput)
//         .then((field: Field) => _.get(field, 'metadata.numberValue') as number)
// }

// export const resetAllPlayerCounters = async (contextApi: ChatRoomActionContextApi, actions: Action[]): Promise<any> => {
//     return Promise.all(
//         _.map(actions, (action: Action) => {
//             const setLocalStateInput: SetLocalStateInput = {
//                 type: FieldType.JsonObjectField,
//                 name: actionCounterName(action.name),
//                 metadata: {
//                     numberValue: 0,
//                 },
//             }
//             return contextApi
//                 .getUser()
//                 .setLocalState(setLocalStateInput)
//                 .then((saveFieldOutput: SaveFieldOutput) => _.get(saveFieldOutput.field, 'metadata.numberValue') as number)
//             // .then((count: number) => contextApi.getUser().sendSystemComment(`action: ${action.name}, count:${count}`))
//         }),
//     )
// }
