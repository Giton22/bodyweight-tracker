/// <reference path="../pb_data/types.d.ts" />

migrate(
  // ── up: add date_of_birth and sex fields to user_settings ──
  (app) => {
    const col = app.findCollectionByNameOrId('user_settings')

    col.fields.add(new TextField({
      name: 'date_of_birth',
      required: false,
      pattern: '^\\d{4}-\\d{2}-\\d{2}$',
    }))

    col.fields.add(new SelectField({
      name: 'sex',
      required: false,
      maxSelect: 1,
      values: ['male', 'female'],
    }))

    app.save(col)
  },

  // ── down: remove date_of_birth and sex fields from user_settings ──
  (app) => {
    const col = app.findCollectionByNameOrId('user_settings')
    col.fields.removeByName('date_of_birth')
    col.fields.removeByName('sex')
    app.save(col)
  },
)
