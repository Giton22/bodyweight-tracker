package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/tools/types"
)

func init() {
	m.Register(func(app core.App) error {
		col, err := app.FindCollectionByNameOrId("user_settings")
		if err != nil {
			return err
		}

		col.Fields.Add(
			&core.NumberField{
				Name:     "protein_goal_g",
				Required: false,
				Min:      types.Pointer(1.0),
				Max:      types.Pointer(999.0),
			},
			&core.NumberField{
				Name:     "carbs_goal_g",
				Required: false,
				Min:      types.Pointer(1.0),
				Max:      types.Pointer(999.0),
			},
			&core.NumberField{
				Name:     "fat_goal_g",
				Required: false,
				Min:      types.Pointer(1.0),
				Max:      types.Pointer(999.0),
			},
		)

		return app.Save(col)
	}, func(app core.App) error {
		col, err := app.FindCollectionByNameOrId("user_settings")
		if err != nil {
			return err
		}

		col.Fields.RemoveByName("protein_goal_g")
		col.Fields.RemoveByName("carbs_goal_g")
		col.Fields.RemoveByName("fat_goal_g")

		return app.Save(col)
	})
}
