package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/tools/types"
)

func init() {
	m.Register(func(app core.App) error {
		usersCollection, err := app.FindCollectionByNameOrId("_pb_users_auth_")
		if err != nil {
			return err
		}

		// ── food_items (user's personal food library) ──
		foodItems := core.NewBaseCollection("food_items")
		foodItems.ListRule = types.Pointer("user = @request.auth.id")
		foodItems.ViewRule = types.Pointer("user = @request.auth.id")
		foodItems.CreateRule = types.Pointer(`@request.auth.id != ""`)
		foodItems.UpdateRule = types.Pointer("user = @request.auth.id")
		foodItems.DeleteRule = types.Pointer("user = @request.auth.id")
		foodItems.Fields.Add(
			&core.RelationField{
				Name:          "user",
				Required:      true,
				MaxSelect:     1,
				CollectionId:  usersCollection.Id,
				CascadeDelete: true,
			},
			&core.TextField{
				Name:     "name",
				Required: true,
				Max:      200,
			},
			&core.TextField{
				Name:     "brand",
				Required: false,
				Max:      200,
			},
			&core.TextField{
				Name:     "barcode",
				Required: false,
				Max:      50,
			},
			&core.NumberField{
				Name:     "calories_per_100g",
				Required: true,
				Min:      types.Pointer(0.0),
				Max:      types.Pointer(9999.0),
			},
			&core.NumberField{
				Name:     "protein_per_100g",
				Required: false,
				Min:      types.Pointer(0.0),
			},
			&core.NumberField{
				Name:     "carbs_per_100g",
				Required: false,
				Min:      types.Pointer(0.0),
			},
			&core.NumberField{
				Name:     "fat_per_100g",
				Required: false,
				Min:      types.Pointer(0.0),
			},
			&core.NumberField{
				Name:     "default_serving_g",
				Required: false,
				Min:      types.Pointer(1.0),
			},
			&core.SelectField{
				Name:      "source",
				Required:  true,
				MaxSelect: 1,
				Values:    []string{"manual", "openfoodfacts", "nutrition_label"},
			},
			&core.TextField{
				Name:     "off_id",
				Required: false,
				Max:      100,
			},
		)
		foodItems.AddIndex("idx_food_items_user_barcode", true, "user, barcode", "barcode != ''")
		if err := app.Save(foodItems); err != nil {
			return err
		}

		// ── food_log (individual logged food entries) ──
		foodLog := core.NewBaseCollection("food_log")
		foodLog.ListRule = types.Pointer("user = @request.auth.id")
		foodLog.ViewRule = types.Pointer("user = @request.auth.id")
		foodLog.CreateRule = types.Pointer(`@request.auth.id != ""`)
		foodLog.UpdateRule = types.Pointer("user = @request.auth.id")
		foodLog.DeleteRule = types.Pointer("user = @request.auth.id")
		foodLog.Fields.Add(
			&core.RelationField{
				Name:          "user",
				Required:      true,
				MaxSelect:     1,
				CollectionId:  usersCollection.Id,
				CascadeDelete: true,
			},
			&core.TextField{
				Name:     "date",
				Required: true,
				Pattern:  `^\d{4}-\d{2}-\d{2}$`,
			},
			&core.SelectField{
				Name:      "meal_type",
				Required:  true,
				MaxSelect: 1,
				Values:    []string{"breakfast", "lunch", "dinner", "snack"},
			},
			&core.RelationField{
				Name:          "food_item",
				Required:      false,
				MaxSelect:     1,
				CollectionId:  foodItems.Id,
				CascadeDelete: false,
			},
			&core.TextField{
				Name:     "food_name",
				Required: true,
				Max:      200,
			},
			&core.NumberField{
				Name:     "amount_g",
				Required: true,
				Min:      types.Pointer(1.0),
				Max:      types.Pointer(99999.0),
			},
			&core.NumberField{
				Name:     "calories",
				Required: true,
				Min:      types.Pointer(0.0),
				Max:      types.Pointer(99999.0),
			},
			&core.NumberField{
				Name:     "protein",
				Required: false,
				Min:      types.Pointer(0.0),
			},
			&core.NumberField{
				Name:     "carbs",
				Required: false,
				Min:      types.Pointer(0.0),
			},
			&core.NumberField{
				Name:     "fat",
				Required: false,
				Min:      types.Pointer(0.0),
			},
			&core.TextField{
				Name:     "note",
				Required: false,
				Max:      500,
			},
		)
		foodLog.AddIndex("idx_food_log_user_date", false, "user, date", "")
		return app.Save(foodLog)
	}, func(app core.App) error {
		for _, name := range []string{"food_log", "food_items"} {
			col, err := app.FindCollectionByNameOrId(name)
			if err != nil {
				continue
			}
			if err := app.Delete(col); err != nil {
				return err
			}
		}
		return nil
	})
}
