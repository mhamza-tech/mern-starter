/**
 * @rob4lderman
 * mar2020
 */
import { gql } from 'apollo-server'

export default gql`
    enum EffectType {
        AnimationEffect
        SaveFieldEffect
        SaveTileEffect
        IncrementFieldEffect
        SaveEdgeEffect
        SoundEffect,
        VibrationEffect,
        SystemMessageEffect
        InteractionEffect
        AnimationSequenceEffect
        SequenceEffect
        ConcurrentEffect
        TileEffect
        TransferActionEffect
        CreateActionEffect
        DeleteActionEffect
        ModalEffect
        ActionEffect
    }

    type Effect {
        id: ID!
        entityType: EntityType!
        type: EffectType!
        collectionId: String!
        scope: EntityScope
        sessionUserId: String
        trackingId: String
        metadata: JSONObject
        createdAt: DateTime!
        updatedAt: DateTime!
        asAnimationEffect: AnimationEffect
        asAnimationSequenceEffect: AnimationSequenceEffect
        asSequenceEffect: SequenceEffect
        asConcurrentEffect: ConcurrentEffect
        asSoundEffect: SoundEffect
        asVibrationEffect: VibrationEffect
        asSystemMessageEffect: SystemMessageEffect
        asActionEffect: ActionEffect
        asInteractionEffect: InteractionEffect
        asTransferActionEffect: TransferActionEffect
        asCreateActionEffect: CreateActionEffect
        asDeleteActionEffect: DeleteActionEffect
        asTileEffect: TileEffect
        asModalEffect: ModalEffect
        eid: String!
        thisEid: String
        thisEntityId: String
        thisEntityType: EntityType
        isLocal: Boolean
        isPrivate: Boolean
        receipts: ReceiptsOutput
    }

    input CreateEffectInput {
        collectionId: String!
        thisEid: String!
        scope: EntityScope!
        type: EffectType!
        metadata: JSONObject
    }

    input CreateAnimationEffectInput {
        animationType: AnimationType!
        collectionId: String!
        scope: EntityScope!
        thisEid: String!
        sourceUri: String
        tileId: String
        startFrame: Int
        endFrame: Int
        loop: Boolean
        speed: Float
    }

    type CreateEffectOutput {
        effect: Effect
    }

    input EffectsInput {
        pageInput: PageInput
        collectionId: String
    }

    type EffectsOutput {
        pageInfo: PageInfo!
        effects: [Effect]
    }

    enum SourceType {
        Gif
        Lottie
    }

    """
    Generated whenever an ActionXInstance is created.
    """
    type CreateActionEffect {
        metadata: CreateActionEffectMetadata
    }

    type CreateActionEffectMetadata {
        """
        The input to the create operation. 
        """
        input: ActionXInstanceTemplate

        """
        A snapshot of the created actionInstance.
        """
        actionInstanceSnapshot: ActionXInstance
    }

    """
    Generated whenever an ActionXInstance is deleted.
    """
    type DeleteActionEffect {
        metadata: DeleteActionEffectMetadata
    }

    type DeleteActionEffectMetadata {
        """
        The input to the delete operation. 
        """
        input: ActionXInstanceTemplate

        """
        A snapshot of the deleted actionInstance.
        """
        actionInstanceSnapshot: ActionXInstance
    }

    """
    Generated whenever an ActionXInstance is transferred from one player to another.
    """
    type TransferActionEffect {
        metadata: TransferActionEffectMetadata
    }

    type TransferActionEffectMetadata {
        """
        The input to the transfer operation. 
        Identifies the to and from players.
        """
        input: ActionXInstanceTransferTemplate

        """
        A snapshot of the actionInstance, AFTER transferring.
        """
        actionInstanceSnapshot: ActionXInstance
    }

    """
    The template is used by the handler code to create or delete an ActionXInstance.
    Note: one of id or actionName is required.
    """
    type ActionXInstanceTemplate {
        id: ID
        actionName: String
        playerEid: String
        creatorEid: String
        isDeleted: Boolean
        metadata: JSONObject
        trxDescription: String
    }

    """
    The template is used by the handler code to describe the transfer of an ActionXInstance
    Note: one of id or actionName is required.
    """
    type ActionXInstanceTransferTemplate {
        id: ID
        actionName: String
        playerEid: String
        isDeleted: Boolean
        metadata: JSONObject
        trxDescription: String
        transferToPlayerEid: String
    }

    enum NativeAnimations {
        AddToInventoryFallDownFullScreen
        Hover
        Dizzy
    }

    type InteractionEffect {
        id: ID!
        asEffect: Effect!
        actor: Player
        targetPlayer: Player
        action: ActionX
        hashStatus: HashStatus
        text: String
    }

    enum SpriteAnimations {
        Orbit
        Explosion
    }
    
    type AnimationEffect {
        metadata: AnimationEffectMetadata
    }

    type AnimationEffectMetadata {
        animationType: AnimationType
        sourceType: SourceType

        """
        The URI of the animation to play.
        This can refer to a lottie file (.json) or a gif (.gif).
        Must have either a .json or .gif extension.
        """
        sourceUri: String

        """
        maps to lottie-react-native startFrame prop
        """
        startFrame: Int

        """
        maps to lottie-react-native endFrame prop
        """
        endFrame: Int

        """
        maps to lottie-react-native loop prop
        """
        loop: Boolean

        """
        maps to lottie-react-native speed prop
        """
        speed: Float

        """
        Specifies the tile on which to run the animation.
        """
        tileId: String

        """
        Specifies the tile on which to run the animation.
        """
        tileName: String

        """
        Resolves the Tile identified by tileId.
        For use by the front-end only.
        """
        tile: Tile

        backgroundColor: String

        """
        Indicates the number of milliseconds the animation should loop
        before terminating.
        """
        loopForMs: Int

        """
        maps to react-native-animatable animation prop.
        Note: the following animations are not supported due to skewX issues:
        jello, lightSpeedIn, lightSpeedOut
        see: https://github.com/oblador/react-native-animatable/issues/147
        """
        animation: String

        """
        maps to react-native-animatable duration prop.
        in milliseconds.
        """
        duration: Int

        """
        maps to react-native-animatable iterationCount prop.
        """
        iterationCount: Int

        """
        maps to react-native-animatable delay prop.
        in milliseconds.
        """
        delay: Int

        """ This one should be ignored by the FE """
        animationTemplate: String
        """ Sprite animation properties """
        sprite: Image
        spriteSize: Int
        """ Orbit properties"""
        radius: Float
        """ Explosion properties """
        gravity: Float
        numberOfParticles: Int
        emissionRate: Int
        particleLife: Int
        direction: Int
        spread: Int
    }

    type TileEffect {
        metadata: TileMetadata
    }

    type AnimationSequenceEffect {
        metadata: AnimationSequenceEffectMetadata
    }

    type AnimationSequenceEffectMetadata {
        tileId: String
        animationSequence: AnimationSequence
    }

    type AnimationSequence {
        isDeletedOnFinish: Boolean
        animations: [AnimationEffectMetadata]
    }

    type SoundEffect {
        soundType: SoundType @deprecated(reason:"Use SoundEffectMetadata.soundType")
        sourceUri: String @deprecated(reason:"Use SoundEffectMetadata.sourceUri")
        metadata: SoundEffectMetadata
    }

    type SoundEffectMetadata {
        soundType: SoundType
        sourceUri: String
    }

    type VibrationEffect {
      metadata: VibrationEffectMetadata
    }

    type VibrationEffectMetadata {
      vibrationType: VibrationType
      duration: Int
    }

    enum ModalType {
      Simple
      SimpleQuarter
      SimpleConfirmation
      SwippableCards
      ItemAward
      ProgressBar
    }

    enum ModalPosition {
      Fullscreen
      Centered
    }

    type ProgressBarModal {
      metadata: ProgressBarModalCustomData
    }

    type SwippableCardsModal {
      metadata: SwippableCardsModalCustomData
    }

    union ModalEffectCustomData = ProgressBarModalCustomData | SwippableCardsModalCustomData

    type ModalEffectMetadata {
      """
      Indicates the modal position.
      """
      position: ModalPosition

      """
      Indicates the modal type and corresponding metadata type.
      """
      modalType: ModalType!

      """
      Indicates whether the user can use escape or clicking on the backdrop to close the modal.
      """
      disableClose: Boolean

      """
      Indicates if the dialog has a backdrop.
      """
      hasBackdrop: Boolean

      """
      The action to submit when the modal is dismissed.
      Other callbacks associated to modal buttons take priority over this.
      """
      actionCallback: ActionCallback

      texts: ModalTexts
      buttons: ModalButtons
      animations: ModalAnimatons
      images: ModalImages
     
      metadata: ModalEffectCustomData
      
      asProgressBarModal: ProgressBarModal
      asSwippableCardsModal: SwippableCardsModal
    }

    type ModalButton {
      text: String
      actionCallback: String
    }

    type ModalAnimation {
      """
      The URI of the animation to play.
      This can refer to a lottie file (.json) or a gif (.gif).
      Must have either a .json or .gif extension.
      """
      sourceUri: String!
      sourceType: SourceType!
    }

    type ModalTexts {
      primary: String
      secondary: String
      tertiary: String
    }

    type ModalButtons {
      primary: ModalButton
      secondary: ModalButton
      tertiary: ModalButton
    }

    type ModalImages {
      primary: Image
      secondary: Image
      tertiary: Image
    }

    type ModalAnimatons {
      primary: ModalAnimation
      secondary: ModalAnimation
      tertiary: ModalAnimation
    }

    type ProgressBarModalCustomData {
      size: Int
      progress: Int
    }

    type ModalSwipeCard {
      texts: ModalTexts
      buttons: ModalButtons
      animations: ModalAnimatons
      images: ModalImages
      backgroundColor: String
    }

    type SwippableCardsModalCustomData {
      cards: [ModalSwipeCard]
    }

    type ModalEffect {
      """
      The type of the metadata corresponds to the ModalType.
      """
      metadata: ModalEffectMetadata

      
    }

    type SystemMessageEffect {
        text: String @deprecated(reason:"Use SystemMessageEffectMetadata.text")
        isVisibleToMe: Boolean @deprecated(reason:"invalid: https://gitlab.com/unrealfun/docs/blob/master/GameState.md")
        image: Image @deprecated(reason:"Use SystemMessageEffectMetadata.image")
        metadata: SystemMessageEffectMetadata
    }

    type SystemMessageEffectMetadata {
        text: String

        """
        Indicates the visual treatment for the message applied on the client
        """
        style: SystemMessageStyle

        """
        Optional image to show with the system message
        """
        image: Image
    }

    type ActionEffect {
        """
        This is executed as soon as it is run, redundant but needed.
        """
        actionCallback: ActionCallback
    }

    type SequenceEffect {
      metadata: SequenceEffectMetadata
    }

    type SequenceEffectMetadata {
      sequenceEffectItems: [SequenceEffectItem]
    }

    union SequenceEffectItemMetadata = AnimationEffectMetadata | SystemMessageEffectMetadata | SoundEffectMetadata | VibrationEffectMetadata | TileMetadata

    type SequenceEffectItem {
      """
      Indicates the effect type and corresponding metadata type.
      """
      type: EffectType

      """
      The type of the metadata corresponds to the EffectType.
      """
      metadata: SequenceEffectItemMetadata

      asAnimationEffect: AnimationEffect
      asSystemMessageEffect: SystemMessageEffect
      asActionEffect: ActionEffect
      asSoundEffect: SoundEffect
      asVibrationEffect: VibrationEffect
      asTileEffect: TileEffect

      """
      Indicates whether to wait for a user tap before proceeding
      to the next SequenceEffectItem
      """
      waitForTap: Boolean

      """
      Indicates whether to remove the artifacts associated with
      this SequenceEffectItem from the screen when it is finished.
      """
      isDeletedOnFinish: Boolean

      """
      The action to submit when the SequenceEffectItem finishes.
      If waitForTap = true, the action is submitted after the tap.
      """
      actionCallback: ActionCallback

      concurrencyDuration: Int
    }

    type ConcurrentEffect {
      metadata: ConcurrentEffectMetadata
    }

    type ConcurrentEffectMetadata {
      groups: [ConcurrentEffectGroup]
    }

    type ConcurrentEffectGroup {
      """
      Effects to start in parallel
      """
      effects: [SequenceEffectItem]

      """
      Indicates the duration in milliseconds (ms) to play before moving to the next sequence.
      """
      duration: Int
    }

    type ActionCallback {
        actionName: String
    }

    enum AnimationType {
        SourcedAnimation
        """
        Indicates react-native-animatable animations
        """
        NativeAnimatableAnimation

        """
        Indicates the animation is client specific and runs using native frameworks.
        """
        NativeAnimation

        SpriteAnimation
    }

    enum SoundType {
        SourcedSound
        WhooshSound
    }

    enum VibrationType {
      Default
    }

    enum SystemMessageStyle {
      """
      The most basic type of system message
      """
      Default

      """
      Chat bubble style #1
      """
      ChatStyle01

      """
      Chat bubble style #2
      """
      ChatStyle02
    }

    type Mutation {
        createEffect(input:CreateEffectInput!): CreateEffectOutput!
        createAnimationEffect(input:CreateAnimationEffectInput!): CreateEffectOutput!
    }
`
