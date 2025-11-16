import { useMemo } from "react";
import { useTheme } from "../theme/ThemeProvider";
import { ThemeName, ThemeOption, themeOptions } from "../theme/themes";

const themeGroups = {
  core: themeOptions.filter((theme: ThemeOption) => theme.tier === "core"),
  ultra: themeOptions.filter((theme: ThemeOption) => theme.tier === "ultra"),
};

export const ThemeControls = () => {
  const { settings, setTheme, updateSettings } = useTheme();

  const activeTheme = useMemo(
    () =>
      themeOptions.find((theme) => theme.id === settings.theme) ??
      themeOptions[0],
    [settings.theme],
  );

  return (
    <div className="theme-controls">
      <div className="form-group">
        <label htmlFor="theme-select">Palette</label>
        <select
          id="theme-select"
          value={settings.theme}
          onChange={(event) => setTheme(event.target.value as ThemeName)}
        >
        <optgroup label="Core themes">
          {themeGroups.core.map((theme: ThemeOption) => (
            <option key={theme.id} value={theme.id}>
              {theme.label}
            </option>
          ))}
        </optgroup>
        <optgroup label="ULTRA collection">
          {themeGroups.ultra.map((theme: ThemeOption) => (
            <option key={theme.id} value={theme.id}>
              {theme.label}
            </option>
            ))}
          </optgroup>
        </select>
        <p className="form-help">{activeTheme.description}</p>
      </div>

      <div className="control-row">
        <div className="form-group">
          <label>Contrast</label>
          <div className="chip-row">
            <button
              type="button"
              className={`chip-toggle ${settings.contrast === "normal" ? "active" : ""}`}
              onClick={() => updateSettings({ contrast: "normal" })}
            >
              Normal
            </button>
            <button
              type="button"
              className={`chip-toggle ${settings.contrast === "high" ? "active" : ""}`}
              onClick={() => updateSettings({ contrast: "high" })}
            >
              High
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Motion</label>
          <div className="chip-row">
            <button
              type="button"
              className={`chip-toggle ${settings.motion === "normal" ? "active" : ""}`}
              onClick={() => updateSettings({ motion: "normal" })}
            >
              Animate
            </button>
            <button
              type="button"
              className={`chip-toggle ${settings.motion === "reduce" ? "active" : ""}`}
              onClick={() => updateSettings({ motion: "reduce" })}
            >
              Reduce
            </button>
          </div>
        </div>
      </div>

      <div className="control-row">
        <div className="form-group">
          <label>Text Scale</label>
          <div className="chip-row">
            <button
              type="button"
              className={`chip-toggle ${settings.textSize === "normal" ? "active" : ""}`}
              onClick={() => updateSettings({ textSize: "normal" })}
            >
              Base
            </button>
            <button
              type="button"
              className={`chip-toggle ${settings.textSize === "large" ? "active" : ""}`}
              onClick={() => updateSettings({ textSize: "large" })}
            >
              Large
            </button>
            <button
              type="button"
              className={`chip-toggle ${settings.textSize === "xl" ? "active" : ""}`}
              onClick={() => updateSettings({ textSize: "xl" })}
            >
              XL
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Text Spacing</label>
          <div className="chip-row">
            <button
              type="button"
              className={`chip-toggle ${settings.textSpacing === "normal" ? "active" : ""}`}
              onClick={() => updateSettings({ textSpacing: "normal" })}
            >
              Normal
            </button>
            <button
              type="button"
              className={`chip-toggle ${settings.textSpacing === "increased" ? "active" : ""}`}
              onClick={() => updateSettings({ textSpacing: "increased" })}
            >
              Spacious
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
