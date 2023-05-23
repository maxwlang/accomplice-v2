import Accomplice from '../accomplice'

export default interface EventHandle {
    name: string
    description: string

    // Discord event to handle
    trigger: string

    // Should it only fire event one time
    fireOnce: boolean

    execute: ({
        args,
        bot
    }: {
        args?: unknown[]
        bot: Accomplice
    }) => Promise<void>
}
