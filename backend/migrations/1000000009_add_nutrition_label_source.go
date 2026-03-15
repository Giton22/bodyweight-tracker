package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		col, err := app.FindCollectionByNameOrId("food_items")
		if err != nil {
			return err
		}

		col.Fields.RemoveByName("source")
		col.Fields.Add(&core.SelectField{
			Name:      "source",
			Required:  true,
			MaxSelect: 1,
			Values:    []string{"manual", "openfoodfacts", "nutrition_label"},
		})

		return app.Save(col)
	}, func(app core.App) error {
		col, err := app.FindCollectionByNameOrId("food_items")
		if err != nil {
			return err
		}

		col.Fields.RemoveByName("source")
		col.Fields.Add(&core.SelectField{
			Name:      "source",
			Required:  true,
			MaxSelect: 1,
			Values:    []string{"manual", "openfoodfacts"},
		})

		return app.Save(col)
	})
}
