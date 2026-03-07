/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    // ── weight_entries ──
    const weightEntries = new Collection({
      type: 'base',
      name: 'weight_entries',
      listRule: 'user = @request.auth.id',
      viewRule: 'user = @request.auth.id',
      createRule: '@request.auth.id != ""',
      updateRule: 'user = @request.auth.id',
      deleteRule: 'user = @request.auth.id',
      fields: [
        {
          name: 'user',
          type: 'relation',
          required: true,
          maxSelect: 1,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
        },
        {
          name: 'date',
          type: 'text',
          required: true,
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
        {
          name: 'weight_kg',
          type: 'number',
          required: true,
          min: 1,
          max: 999,
        },
        {
          name: 'note',
          type: 'text',
          required: false,
          max: 500,
        },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_weight_entries_user_date ON weight_entries (user, date)',
      ],
    })
    app.save(weightEntries)

    // ── calorie_entries ──
    const calorieEntries = new Collection({
      type: 'base',
      name: 'calorie_entries',
      listRule: 'user = @request.auth.id',
      viewRule: 'user = @request.auth.id',
      createRule: '@request.auth.id != ""',
      updateRule: 'user = @request.auth.id',
      deleteRule: 'user = @request.auth.id',
      fields: [
        {
          name: 'user',
          type: 'relation',
          required: true,
          maxSelect: 1,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
        },
        {
          name: 'date',
          type: 'text',
          required: true,
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
        {
          name: 'calories',
          type: 'number',
          required: false,
          min: 0,
          max: 99999,
        },
        {
          name: 'goal_override_kcal',
          type: 'number',
          required: false,
          min: 0,
          max: 99999,
        },
        {
          name: 'note',
          type: 'text',
          required: false,
          max: 500,
        },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_calorie_entries_user_date ON calorie_entries (user, date)',
      ],
    })
    app.save(calorieEntries)

    // ── kcal_goal_history ──
    const kcalGoalHistory = new Collection({
      type: 'base',
      name: 'kcal_goal_history',
      listRule: 'user = @request.auth.id',
      viewRule: 'user = @request.auth.id',
      createRule: '@request.auth.id != ""',
      updateRule: 'user = @request.auth.id',
      deleteRule: 'user = @request.auth.id',
      fields: [
        {
          name: 'user',
          type: 'relation',
          required: true,
          maxSelect: 1,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
        },
        {
          name: 'effective_from',
          type: 'text',
          required: true,
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
        {
          name: 'kcal',
          type: 'number',
          required: true,
          min: 0,
          max: 99999,
        },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_kcal_goal_history_user_date ON kcal_goal_history (user, effective_from)',
      ],
    })
    app.save(kcalGoalHistory)

    // ── user_settings ──
    const userSettings = new Collection({
      type: 'base',
      name: 'user_settings',
      listRule: 'user = @request.auth.id',
      viewRule: 'user = @request.auth.id',
      createRule: '@request.auth.id != ""',
      updateRule: 'user = @request.auth.id',
      deleteRule: 'user = @request.auth.id',
      fields: [
        {
          name: 'user',
          type: 'relation',
          required: true,
          maxSelect: 1,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
        },
        {
          name: 'unit',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: ['kg', 'lbs'],
        },
        {
          name: 'goal_weight_kg',
          type: 'number',
          required: false,
          min: 1,
          max: 999,
        },
        {
          name: 'height_cm',
          type: 'number',
          required: false,
          min: 1,
          max: 300,
        },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_user_settings_user ON user_settings (user)',
      ],
    })
    app.save(userSettings)
  },

  // ── down: drop all four collections ──
  (app) => {
    for (const name of ['user_settings', 'kcal_goal_history', 'calorie_entries', 'weight_entries']) {
      try {
        const col = app.findCollectionByNameOrId(name)
        app.delete(col)
      }
      catch (_) {
        // already gone
      }
    }
  },
)
