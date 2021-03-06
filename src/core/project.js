const { ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const baseDir = 'projects';

function getSpecPath(arg) {
  return path.join(baseDir, arg.projectName, 'specs', arg.specName);
}

function getProjects() {
  const projects = [];
  fs.readdirSync(baseDir).forEach((file) => {
    const stat = fs.statSync(path.join(baseDir, file));
    if (stat.isDirectory()) {
      const statusPath = path.join(baseDir, file, 'status.json');
      projects.push(JSON.parse(fs.readFileSync(statusPath, 'utf8')));
    }
  });
  return projects;
}

ipcMain.on('sync', (e) => {
  e.returnValue = getProjects();
});

ipcMain.on('read', (e, arg) => {
  const specPath = getSpecPath(arg);
  let content = '';
  try {
    content = fs.readFileSync(`${specPath}.js`, { encoding: 'utf8' });
  } catch (e) {
    console.error(e);
  } finally {
    e.returnValue = content;
  }
});

function submitCode(arg) {
  const specPath = getSpecPath(arg);
  fs.writeFile(`${specPath}.js`, arg.content, { encoding: 'utf8' }, (err) => {
    e.sender.send('submit-code-resp', err ? 'error' : 'ok');
  });
}

function createProject(name) {
  const projectPath = path.join(baseDir, name);
  const initialStatus = {
    name,
    specs: []
  };
  try {
    fs.mkdirSync(projectPath);
    fs.writeFileSync(path.join(projectPath, 'status.json'), JSON.stringify(initialStatus), {
      encoding: 'utf8'
    }); // Create status file
    fs.mkdirSync(path.join(projectPath, 'specs')); // Create specs directory
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

function createSpec(arg) {
  let { projectName, specName } = arg;
  const projectPath = path.join(baseDir, projectName);
  let specPath = path.join(projectPath, 'specs', `${specName}.js`);
  if (fs.existsSync(specPath)) {
    specName = `${specName} - ${new Date().getTime()}`;
    specPath = path.join(projectPath, 'specs', `${specName}.js`);
  }
  try {
    fs.writeFileSync(specPath, '// Write some cases here', {
      encoding: 'utf8'
    });
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

ipcMain.on('create-project', (e, arg) => {
  e.returnValue = createProject(arg.projectName);
});

ipcMain.on('create-spec', (e, arg) => {
  e.returnValue = createSpec(arg);
});

ipcMain.on('remove-spec', (e, arg) => {
  const { specName, projectName } = arg;
  const specPath = path.join(baseDir, projectName, 'specs', `${specName}.js`);
  fs.unlink(specPath, (err) => {
    console.log(err);
  });
});

ipcMain.on('save-project', (e, arg) => {
  const { name } = arg;
  const projectStatusPath = path.join(baseDir, name, 'status.json');
  try {
    fs.writeFileSync(projectStatusPath, JSON.stringify(arg), {
      encoding: 'utf8'
    });
    e.returnValue = true;
  } catch (err) {
    console.err(err);
    e.returnValue = false;
  }
});

ipcMain.on('save-code', (e, arg) => {
  const specPath = getSpecPath(arg);
  try {
    fs.writeFileSync(`${specPath}.js`, arg.content, { encoding: 'utf8' });
    e.returnValue = true;
  } catch (err) {
    console.error(err);
    e.returnValue = false;
  }
});
