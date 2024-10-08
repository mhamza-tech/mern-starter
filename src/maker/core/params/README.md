## Maker API @UnrealChatroom parameter decorators
Use these to extract data as function parameters.

### @UnrealJobId()
Extracts the processed Job ID
```ts
  @UnrealAction('myfuncname')
  nodeApiJobProcess(@UnrealJobId() jobId?: string): Promise<any> {
    console.log(jobId) // d9416fdf-9990-48d6-a4b0-5d494370ebff
  }
```

### @UnrealJobId()
Extracts the processed Job node context values
```ts
  @UnrealAction('myfuncname')
  nodeApiJobProcess(@UnrealJobNodeEid() jobNodeEid?: string): Promise<any> {
    console.log(jobNodeEid)
    // This was of type User since the job was scheduled using context.getActor().schedulerJob()
    // user/6c1f38b5-7919-4a42-9725-077eb6ae0f9b
  }
```

### @UnrealJob()
Extracts the action args, which contains job info
```ts
  @UnrealAction('myfuncname')
  nodeApiJobProcess(@UnrealJob() jobargs?: any): Promise<any> {
    console.log(jobargs)
    console.log(actionArgs)
    // {
    //   myArg: 1,
    //   jobId: 2
    //   gameNode,
    //   ...
    // }
  }
```

### @UnrealActionArgs()
Extracts the action args
```ts
  @UnrealAction('myfuncname')
  nodeApiJobProcess(@UnrealActionArgs() actionArgs?: any): Promise<any> {
    console.log(actionArgs)
    // {
    //   myArg: 1,
    //   jobId: 2
    //   gameNode,
    //   ...
    // }
  }
```