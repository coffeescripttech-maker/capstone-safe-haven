-- Update header_config table to store preset logos
-- This adds columns for logo URLs for each preset

-- Add logo columns for each preset
ALTER TABLE header_config ADD COLUMN logo_default TEXT;
ALTER TABLE header_config ADD COLUMN logo_reversed TEXT;
ALTER TABLE header_config ADD COLUMN logo_stacked TEXT;

-- Update the default row with initial values
UPDATE header_config 
SET 
  logo_default = 'assets/img/version_2/dubaifilmmaker.svg',
  logo_reversed = 'assets/img/version_1/dubaifilmmaker.svg',
  logo_stacked = 'assets/img/dubaifilmmaker123.svg',
  config_json = '{
    "presets": {
      "default": {
        "name": "Default Layout",
        "description": "Logo left, menu right, optimized for horizontal logo",
        "mobile": {
          "headerNav": {"alignItems": "center", "padding": "10px 0", "minHeight": "0px", "flexDirection": "row"},
          "logoLink": {"maxWidth": "calc(100% - 100px)", "flex": "1"},
          "logo": {"maxHeight": "80px", "maxWidth": "100%", "width": "auto"}
        },
        "desktop": {
          "logo": {"maxHeight": "80px", "width": "100%"}
        },
        "extraLarge": {
          "logo": {"maxHeight": "100px"}
        }
      },
      "reversed": {
        "name": "Reversed Layout",
        "description": "Logo right, menu left - comprehensive layout with navigation positioning",
        "mobile": {
          "headerNav": {"alignItems": "center", "padding": "0px", "minHeight": "50px", "flexDirection": "row-reverse", "justifyContent": "space-between", "gap": "24px", "width": "100%"},
          "logoLink": {"maxWidth": "180px", "flexShrink": "0", "paddingRight": "0px", "width": "auto", "margin": "0"},
          "logo": {"maxHeight": "80px", "maxWidth": "100%", "width": "auto", "margin": "0"}
        },
        "desktop": {
          "headerNav": {"flexDirection": "row-reverse", "justifyContent": "space-between", "gap": "24px", "alignItems": "center", "width": "100%", "minHeight": "50px"},
          "logoLink": {"width": "auto", "flexShrink": "0", "margin": "0"},
          "logo": {"maxHeight": "80px", "width": "auto", "margin": "0"}
        },
        "extraLarge": {
          "logo": {"maxHeight": "100px"}
        }
      },
      "stackedLogo": {
        "name": "Stacked Logo",
        "description": "Optimized for tall stacked logo (DUBAI FILM MAKER)",
        "mobile": {
          "headerNav": {"alignItems": "center", "padding": "0px 0", "minHeight": "40px", "flexDirection": "row"},
          "logoLink": {"maxWidth": "calc(100% - 100px)", "flex": "1"},
          "logo": {"maxHeight": "100px", "maxWidth": "100%", "width": "auto"}
        },
        "desktop": {
          "logo": {"maxHeight": "80px", "width": "100%"}
        },
        "extraLarge": {
          "logo": {"maxHeight": "120px"}
        }
      }
    }
  }'
WHERE id = 1;
