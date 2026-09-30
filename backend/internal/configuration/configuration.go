package configuration

type Category struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Icon        string `json:"icon"`
	Color       string `json:"color"`
	SortOrder   int    `json:"sortOrder"`
}

type Status struct {
	ID          string `json:"id"`
	Code        string `json:"code"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Color       string `json:"color"`
	SortOrder   int    `json:"sortOrder"`
	IsDefault   bool   `json:"isDefault"`
	IsTerminal  bool   `json:"isTerminal"`
}

type Priority struct {
	ID        string `json:"id"`
	Code      string `json:"code"`
	Name      string `json:"name"`
	Color     string `json:"color"`
	SortOrder int    `json:"sortOrder"`
	Weight    int    `json:"weight"`
}

type CustomField struct {
	ID         string   `json:"id"`
	Name       string   `json:"name"`
	FieldKey   string   `json:"fieldKey"`
	FieldType  string   `json:"fieldType"`
	Options    []string `json:"options,omitempty"`
	SortOrder  int      `json:"sortOrder"`
}

type SystemSettings struct {
	AppName         string `json:"appName"`
	BrandColor      string `json:"brandColor"`
	DefaultPageSize int    `json:"defaultPageSize"`
	DefaultTimezone string `json:"defaultTimezone"`
}
