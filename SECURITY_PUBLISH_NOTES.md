# Security Publish Notes

This repository is a public-safe export of local creative projects from Digital Lab.

Before publishing, the export excluded:

- Nested Git histories.
- `node_modules`, build outputs, caches, logs and local databases.
- Local ffmpeg binaries.
- Local Godot editor cache.
- `ProjectStarlight`, because it contains assistant memory/business data and non-art automation logic.
- `TouchDesigner_Projects`, because the user asked to omit the TouchDesigner project files from the public upload.
- Hardcoded local machine paths.
- Hardcoded API keys.

TouchDesigner experience is described in the README, but `.toe` project files are not included in this public export.

If you clone this repository, install project dependencies per subproject before running anything.
