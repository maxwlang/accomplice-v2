import { getEmojiType, hasEmoji } from '../../src/util/emoji'
import { ReactionType } from '../../src/sequelize/types/reaction'

describe('emoji utilities', () => {
    it('detects built in emoji', () => {
        expect(getEmojiType({ id: null, animated: false } as any)).toBe(
            ReactionType.Emoji
        )
    })

    it('detects animated custom emoji', () => {
        expect(getEmojiType({ id: '123', animated: true } as any)).toBe(
            ReactionType.CustomGIF
        )
    })

    it('detects custom emoji', () => {
        expect(getEmojiType({ id: '123', animated: false } as any)).toBe(
            ReactionType.Custom
        )
    })

    it('hasEmoji finds known emoji', () => {
        expect(hasEmoji('😀')).toBe(true)
    })
})
