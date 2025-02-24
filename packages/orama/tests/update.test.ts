import t from 'tap'
import { create, insert, getByID, update, updateMultiple, count } from '../src/index.js'

t.test('update method', async (t) => {
  t.test('should remove a document the old document and insert the new one', async (t) => {
    const db = create({
      schema: {
        quote: 'string',
        author: 'string',
        meta: {
          tags: 'string'
        }
      } as const
    })

    const oldDocId = insert(db, {
      quote: "Life is what happens when you're busy making other plans",
      author: 'John Lennon',
      meta: {
        tags: 'music, life, music'
      }
    }) as string

    const newDocId = await update(db, oldDocId, {
      quote: 'What I cannot create, I do not understand',
      author: 'Richard Feynman',
      meta: {
        tags: 'physics, science, philosophy'
      }
    })

    const oldDoc = getByID(db, oldDocId)
    t.notOk(oldDoc)

    const newDoc = getByID(db, newDocId)
    t.ok(newDoc)

    t.equal(count(db), 1)
  })
})

t.test('updateMultiple', async (t) => {
  t.test('should update the documents', async (t) => {
    const db = create({
      schema: {
        quote: 'string',
        author: 'string'
      } as const
    })

    const oldDocId1 = await insert(db, {
      quote: "Life is what happens when you're busy making other plans",
      author: 'John Lennon'
    })
    const oldDocId2 = await insert(db, {
      quote: 'What I cannot create, I do not understand'
    })

    const [id1, id2] = await updateMultiple(
      db,
      [oldDocId1, oldDocId2],
      [
        {
          quote: 'He who is brave is free',
          author: 'Seneca'
        },
        {
          quote: 'You must be the change you wish to see in the world',
          author: 'Mahatma Gandhi'
        }
      ]
    )

    t.notOk(getByID(db, oldDocId1))
    t.notOk(getByID(db, oldDocId2))

    t.ok(getByID(db, id1))
    t.ok(getByID(db, id2))

    t.end()
  })

  t.test('should skip the update if a document is not valid', async (t) => {
    const db = create({
      schema: {
        quote: 'string'
      } as const
    })

    const oldDocId = await insert(db, {
      quote: "Life is what happens when you're busy making other plans",
      author: 'John Lennon'
    })

    t.throws(() => updateMultiple(db, [oldDocId], [{ quote: 55 }] as any))

    t.ok(getByID(db, oldDocId))
    t.equal(count(db), 1)

    t.end()
  })

  t.end()
})
