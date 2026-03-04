# Solar Monitoring Design System

This document outlines the UI components and design specifications for the Solar Monitoring Landing Page, following Atomic Design principles.

## Colors & Themes

The application supports both Light and Dark modes. The aesthetic is clean, modern, and professional.

### Light Theme Tokens
- `--bg-primary`: `#F8FAFC` (Slate 50)
- `--bg-secondary`: `#FFFFFF` (White)
- `--text-primary`: `#0F172A` (Slate 900)
- `--text-secondary`: `#64748B` (Slate 500)
- `--border-color`: `#E2E8F0` (Slate 200)

### Dark Theme Tokens
- `--bg-primary`: `#0F172A` (Slate 900)
- `--bg-secondary`: `#1E293B` (Slate 800)
- `--text-primary`: `#F8FAFC` (Slate 50)
- `--text-secondary`: `#94A3B8` (Slate 400)
- `--border-color`: `#334155` (Slate 700)

### Semantic Colors (Alert Levels)
- `--color-safe`: `#10B981` (Emerald 500) - Quiet / Low Risk
- `--color-warning`: `#F59E0B` (Amber 500) - Active / Moderate Risk
- `--color-danger`: `#EF4444` (Red 500) - Storm / High Risk

---

## 1. Atoms
Basic building blocks of the interface.

### 2. Typography & Icons
- **Primary Font**: `Inter`, sans-serif. Used exclusively for its high legibility on numbers and data-heavy interfaces.
- **Sizes & Weights**:
  - `ds-title`: `1.5rem` (24px), bold (700). Used for major section headers.
  - `ds-body`: `1rem` (16px), normal (400). Used for explanatory text and glossary paragraphs.
  - `label`: `0.75rem` (12px), semi-bold (600), ALL CAPS, with `0.05em` letter spacing. Used for card headers.
  - `value`: `1.75rem` (28px) down from 32px for compactness, bold (700). Used for main data points.
  - `sub-value`: `1rem` (16px), normal (400), secondary text color. Used for context (e.g., "(Quiet)").
- **Animations**: Labels leverage a `.typewriter-text` utility class applying `steps()` keyframes to reveal their content exactly as if printed by a datalink terminal upon component mount.

### Buttons & Toggles
- **Theme Toggle**: A simple, elegant switch component to alternate between Light and Dark mode.
- **Tab Button**: Navigation element (`.tab-button`). Has a distinct hover state and an `.active` state that displays a bottom blue highlight border to indicate the current section.

### Badges / Tags
- Small inline elements to show status (e.g., "(Quiet)", "(C-Class)"). Color depends on severity.

---

## 2. Molecules
Combinations of atoms built for reuse.

### Risk Card
A molecule displaying a specific risk metric (e.g., Solar Flare Risk, Solar Storm Risk).
- **Structure**: A card container with a small uppercase label, a large prominent value alongside a semantic color status dot, and a smaller explanatory sub-value.
- **Color Indicator**: A 12px pulsing or glowing dot alongside the prominent value mapping to the semantic alert state (e.g. green for Safe, yellow for Warning, red for Danger). (Atom).
- **Layout**: Centered text, soft shadow, rounded corners (12px), border. Changes styling subtly on hover.

### KP Index Gauge Segment
A visualization molecule representing the current KP level on a linear color scale.
- **Structure**: A colored bar broken into segments (Green, Yellow, Red) with an indicator line showing the current value.

### Skeleton Loader (Loading State)
Animated placeholder used while data from the Ubidots API is being fetched.
- **Structure**: A grey/slate colored block with a subtle pulsing animation.
- **Usage**: Used to replace text (`ds-title`, `value`, `sub-value`) and graphs until the components are fully rendered. Adapts to light/dark themes.

### Global App Bar (Unified Header)
- **Structure**: A top-level organism bringing together the Main Application Title (Atom), the Tab Navigation Group (Molecules), and the Theme Toggle Switch (Atom).
- **Layout**: Uses a horizontal Flexbox stretching across the screen (`space-between`). Incorporates wrapping (`flex-wrap`) and gap adjustments so on smaller mobile devices the tabs or toggle smoothly flow to the next line without breaking the interface.
- **Interaction**: Handles main application routing logic via the enclosed tabs component, and global color variables via the theme toggle.

---

## Responsive Layout Margin Notes
The main wrapper surrounding both Desktop and Mobile constraints defaults to a safe horizontal padding (e.g. `1.5rem` to `2rem`) to prevent content from bleeding exactly to the monitor/device edges.

---

## 3. Organisms
Relatively complex UI components consisting of groups of molecules/atoms.

### Tabbed Navigation Container
Group of Tab Buttons to switch content views.
- **Structure**: A flex container (`.tabs-container`) with a bottom border, housing multiple Tab Buttons (Atoms).

### Current KP Widget
The main widget showing current geomagnetic activity.
- **Structure**: Section Label + Big Value Text + Status Badge + KP Index Gauge Segment (Molecule).

### Header Navigation
Top bar of the application.
- **Structure**: App Title + Tab Navigation Group (Molecules) + Theme Toggle (Atom).

### Line Chart (Historical Analysis)
An interactive organism mapping multiple historical values over time with selective filtering.
- **Library**: Chart.js / react-chartjs-2.
- **Dual Y-Axes**: The chart dynamically scales two independent Y-axes. The primary (Left) maps geomagnetic values (KP Index: 0-9), while the secondary (Right) maps semantic risk intensities (0-3).
- **Interactive Filtering**: Uses `.filter-container` and `.chip` atoms to allow users to toggle specific datasets on/off.
- **Date Range Picker**: Includes a start and end `date` input alongside a primary 'Update' button to dictate custom data intervals. Limits bounds and defaults to searching for the last 7 days.
- **Labels & Legends**: Legend displays at the top. Tooltips handle multi-index intersection for comparison.
- **Theming**: Grid lines, labels, and chip colors adapt dynamically based on light/dark mode properties.

### Risk Comparison Chart
A multi-line graph comparing the severity trends of the two primary risks (`flare_risk` and `storm_warning`).
- **Structure**: Chart Container mapping dual timelines with discrete semantic color bindings (Yellow for Flare, Red for Storm risk elements).
- **Animation**: Contains a distinct bouncing entrance animation (`easeOutBounce`, `2000ms duration`) that highlights layout hierarchy transitions.

## 4. Layout Composites (Templates)
### Dashboard Overview Core
- **Structure**: To make effective use of widescreen (desktop) displays, the primary overview maps a 2-column flex-grid layout. The entire Application Container expands to `90%` of the user's viewport.
- **Layout Flow (30/70 Split)**: The left column takes up `30%` (3fr) of the space and stacks all primary KPI gauges and risk cards vertically. The right column dedicates `70%` (7fr) of the viewport width to securely hold large interactive elements like the *Risk Comparison Chart*, maintaining equal breathing room on both panels. Mobile constraints (`<768px`) naturally shift the layout backward to a single stack (`1fr`).

---

## 4. Templates & Pages
Page-level objects reflecting the final layout.

### Dashboard Layout
- **Mobile**: Single column layout. Cards stack vertically. Navigation tabs might become scrollable horizontally.
- **Desktop**: Grid layout. KPI widgets are arranged side-by-side or in a balanced structure with the chart taking up full width below them.
