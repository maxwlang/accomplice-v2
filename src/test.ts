const a = new Map()
a.set('thing', 'a')
a.set('thing2', 'a2')
a.set('thing3', 'a3')
a.set('thing4', 'a4')
a.set('thing5', 'a5')
a.set('thing6', 'a6')

const aa = Array.from(a.values())

for (const [key, value] of a) {
    console.log({ key, value })
}

const tasks = []
const size = 4
while (aa.length > 0) {
    tasks.push(aa.splice(0, size))
}

console.log(tasks)
for (const task of tasks) {
    console.log(task)
    const things = task.map(v => {
        return new Promise(res => {
            console.log(v)
            res(v)
        })
    })

    console.log('aa', things)
}

;(async (): Promise<void> => {
    const p = new Promise(res => {
        console.log('aaahah')
        res(true)
    })
    const e = await Promise.all([p, undefined, p, p, undefined, p])

    console.log(e)
})()
