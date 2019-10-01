const electron = require("electron");
const url = require("url");
const path = require("path");

const { app, BrowserWindow, Menu, ipcMain } = electron;

// Set ENV
process.env.NODE_ENV = "production";

let mainWindow, addWindow;

// Listen for app readiness
app.on("ready", () => {
  // Create new window
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    }
  }); //no configuration

  // Load HTML into Url
  mainWindow.loadURL(
    url.format({
      // file://dirname/mainWindow.html
      pathname: path.join(__dirname, "mainWindow.html"),
      protocol: "file:",
      slashes: true
    })
  );

  // Quit app when closed
  mainWindow.on("closed", () => {
    app.quit();
  });

  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(menuTemplate);

  // Instert menu
  Menu.setApplicationMenu(mainMenu);
});

// Handle create Add window
function createAddWindow() {
  // Create new window
  addWindow = new BrowserWindow({
    width: 600,
    height: 400,
    title: "Add a new list item",

    webPreferences: {
      nodeIntegration: true
    }
  });

  // Load HTML into Url
  addWindow.loadURL(
    url.format({
      // file://dirname/addWindow.html
      pathname: path.join(__dirname, "addWindow.html"),
      protocol: "file:",
      slashes: true
    })
  );

  // Garbage collection handle

  addWindow.on("close", () => {
    addWindow = null;
  });
}

// Catch item:add
ipcMain.on("item:add", (event, item) => {
  mainWindow.webContents.send("item:add", item);
  addWindow.close();
});

// Create Menu template
const menuTemplate = [
  {
    label: "File",
    submenu: [
      {
        label: "Add Item",
        click() {
          createAddWindow();
        }
      },
      {
        label: "Remove Items",
        click() {
          mainWindow.webContents.send("item:clear");
        }
      }
    ]
  },
  {
    label: "Edit",
    submenu: [
      {
        label: "Reload",
        role: "reload"
      }
    ]
  },
  {
    label: "About"
  },
  {
    label: "Quit",
    accelerator: process.platform == "darwin" ? "Command+Q" : "Ctrl+Q",
    click() {
      app.quit();
    }
  }
];

// If on a Mac, add empty object to menu, so that File will be the first menu item
if (process.platform == "darwin") {
  menuTemplate.unshift({});
}

// Add Dev Tools menu item if not in production
if (process.env.NODE_ENV !== "production") {
  menuTemplate.push({
    label: "Dev Tools",
    submenu: [
      {
        label: "Toggle DevTools",
        accelerator: process.platform == "darwin" ? "Command+I" : "Ctrl+I",
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      }
    ]
  });
}
