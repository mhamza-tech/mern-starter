/**
 * @rob4lderman
 * nov2019
 * 
 * 
 */

export type ReactionFn = (context: any, args: any) => Promise<any>;

export interface ReactionFnMap {
  [key: string]: ReactionFn
}

// -rx- export interface ActionMatcher {
// -rx-     unObjectId?: string;
// -rx-     name?: string;
// -rx-     tags?: string[];
// -rx- };

export interface Reaction {
  // -rx- actionMatcher: ActionMatcher;
  reactionFn: ReactionFn
}

export interface ReactionRouter {
  [key: string]: Reaction[]
}

export interface RouteInput {
  unObjectId?: string
  handlerUnObjectId?: string
  username?: string
  name: string
  tags: string[]
}

// Support ActionX, Image, UnObject, User, etc. Also plain object if needed
export type BeforeEnterAsset = string | null | undefined | { s3Key: string | null }
