import { NextResponse } from 'next/server';
import { queryD1 } from '@/lib/d1-client';

// CORS headers for cross-origin requests with cache control
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Default header configuration fallback
const DEFAULT_HEADER_CONFIG = {
  activePreset: 'default',
  description: 'Header configuration - switch between different header layouts and logo styles',
  presets: {
    default: {
      name: 'Default Layout',
      description: 'Logo left, menu right, optimized for horizontal logo',
      logo: {
        src: 'assets/img/version_2/dubaifilmmaker.svg',
        alt: 'DubaiFilmMaker'
      },
      mobile: {
        headerNav: {
          alignItems: 'center',
          padding: '10px 0',
          minHeight: '0px',
          flexDirection: 'row'
        },
        logoLink: {
          maxWidth: 'calc(100% - 100px)',
          flex: '1'
        },
        logo: {
          maxHeight: '80px',
          maxWidth: '100%',
          width: 'auto'
        }
      },
      desktop: {
        logo: {
          maxHeight: '80px',
          width: '100%'
        }
      },
      extraLarge: {
        logo: {
          maxHeight: '100px'
        }
      }
    },
    reversed: {
      name: 'Reversed Layout',
      description: 'Logo right, menu left - comprehensive layout with navigation positioning',
      logo: {
        src: 'assets/img/version_1/dubaifilmmaker.svg',
        alt: 'DubaiFilmMaker'
      },
      mobile: {
        headerNav: {
          alignItems: 'center',
          padding: '0px',
          minHeight: '50px',
          flexDirection: 'row-reverse',
          justifyContent: 'space-between',
          gap: '24px',
          width: '100%'
        },
        logoLink: {
          maxWidth: '180px',
          flexShrink: '0',
          paddingRight: '0px',
          width: 'auto',
          margin: '0'
        },
        logo: {
          maxHeight: '80px',
          maxWidth: '100%',
          width: 'auto',
          margin: '0'
        }
      },
      desktop: {
        headerNav: {
          flexDirection: 'row-reverse',
          justifyContent: 'space-between',
          gap: '24px',
          alignItems: 'center',
          width: '100%',
          minHeight: '50px'
        },
        logoLink: {
          width: 'auto',
          flexShrink: '0',
          margin: '0'
        },
        logo: {
          maxHeight: '80px',
          width: 'auto',
          margin: '0'
        }
      },
      extraLarge: {
        logo: {
          maxHeight: '100px'
        }
      }
    },
    stackedLogo: {
      name: 'Stacked Logo',
      description: 'Optimized for tall stacked logo (DUBAI FILM MAKER)',
      logo: {
        src: 'assets/img/dubaifilmmaker123.svg',
        alt: 'DubaiFilmMaker'
      },
      mobile: {
        headerNav: {
          alignItems: 'center',
          padding: '0px 0',
          minHeight: '40px',
          flexDirection: 'row'
        },
        logoLink: {
          maxWidth: 'calc(100% - 100px)',
          flex: '1'
        },
        logo: {
          maxHeight: '100px',
          maxWidth: '100%',
          width: 'auto'
        }
      },
      desktop: {
        logo: {
          maxHeight: '80px',
          width: '100%'
        }
      },
      extraLarge: {
        logo: {
          maxHeight: '120px'
        }
      }
    }
  }
};

// Public API endpoint - no authentication required
// This endpoint is specifically for the portfolio website to fetch header config
export async function GET() {
  try {
    const result = await queryD1('SELECT * FROM header_config WHERE id = 1');
    
    if (!result || !result.results || result.results.length === 0) {
      // Return default config if not found
      return NextResponse.json(
        DEFAULT_HEADER_CONFIG,
        { headers: corsHeaders }
      );
    }

    const headerConfig = result.results[0];
    
    // Parse config_json if it exists
    let parsedConfig = DEFAULT_HEADER_CONFIG;
    
    if (headerConfig.config_json) {
      try {
        const customConfig = JSON.parse(headerConfig.config_json);
        // Merge custom config with default, preserving structure
        parsedConfig = {
          ...DEFAULT_HEADER_CONFIG,
          ...customConfig,
          activePreset: headerConfig.active_preset || 'default',
          presets: {
            ...DEFAULT_HEADER_CONFIG.presets,
            ...(customConfig.presets || {})
          }
        };
      } catch (e) {
        console.error('Error parsing header config JSON:', e);
        // Fall back to default config
        parsedConfig = {
          ...DEFAULT_HEADER_CONFIG,
          activePreset: headerConfig.active_preset || 'default'
        };
      }
    } else {
      // Use active_preset from database with default config
      parsedConfig = {
        ...DEFAULT_HEADER_CONFIG,
        activePreset: headerConfig.active_preset || 'default'
      };
    }

    // Update logo URLs from database for each preset
    if (parsedConfig.presets.default && headerConfig.logo_default) {
      parsedConfig.presets.default.logo = {
        src: headerConfig.logo_default,
        alt: 'DubaiFilmMaker'
      };
    }
    
    if (parsedConfig.presets.reversed && headerConfig.logo_reversed) {
      parsedConfig.presets.reversed.logo = {
        src: headerConfig.logo_reversed,
        alt: 'DubaiFilmMaker'
      };
    }
    
    if (parsedConfig.presets.stackedLogo && headerConfig.logo_stacked) {
      parsedConfig.presets.stackedLogo.logo = {
        src: headerConfig.logo_stacked,
        alt: 'DubaiFilmMaker'
      };
    }

    return NextResponse.json(
      parsedConfig,
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error fetching public header config:', error);
    // Return default config on error
    return NextResponse.json(
      DEFAULT_HEADER_CONFIG,
      { headers: corsHeaders }
    );
  }
}
