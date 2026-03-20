package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		col, err := app.FindCollectionByNameOrId("user_settings")
		if err != nil {
			return err
		}

		col.Fields.Add(&core.JSONField{
			Name:     "dashboard_layout",
			Required: false,
			MaxSize:  10240,
		})

		return app.Save(col)
	}, func(app core.App) error {
		col, err := app.FindCollectionByNameOrId("user_settings")
		if err != nil {
			return err
		}
		col.Fields.RemoveByName("dashboard_layout")
		return app.Save(col)
	})
}
