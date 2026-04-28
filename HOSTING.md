# Local Hosting Instructions

## Serve the project locally
1. Open a terminal in the `EduBytes_Samuel` folder.
2. Run one of these commands:
   - `python -m http.server 8000`
   - `python3 -m http.server 8000`
3. Open your browser at `http://localhost:8000`.

## Autostart web server
Double-click `start-local-host.bat` in this folder.

### Optional port override
If you want to use a different port, open a terminal in the folder and run:

```bat
start-local-host.bat 8080
```

## Notes
- The script will run from the current project folder, so it serves `index.html` and the `src/` files correctly.
- If `python` is not installed, install Python 3 and make sure it is available in your PATH.

## Published online
- Public repository: https://github.com/Creanathan/EduBytes
- GitHub Pages site: https://creanathan.github.io/EduBytes/

The site is configured to serve from the `main` branch root. It may take a few minutes for the Pages build to finish and become live.
