import { titleCase } from '../../src/util/strings'

describe('titleCase', () => {
    it('capitalizes each word', () => {
        expect(titleCase('hello WORLD')).toBe('Hello World')
    })
})
