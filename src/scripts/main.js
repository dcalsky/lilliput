const { ipcRenderer, remote } = require('electron');

const { Menu, MenuItem } = remote;
const $ = require('jquery');
const CodeMirror = require('codemirror');
const prompt = require('electron-prompt');
const path = require('path');
require('codemirror/mode/javascript/javascript');

const menu = new Menu();
let currentCase = null;

class Bug {
  constructor(status) {
    this.id = status.id;
    this.desc = status.desc;
    this.cases = status.cases || [];
    this.tags = status.tags || [];
    this.finished = status.finished || false;
    this.$el = $('<li class="list-group-item"></li>');
    this.updateStatus();
    // $finished.change((e) => {
    //   console.log(e);
    // });
  }

  updateStatus() {
    const $finished = $(`<input type="checkbox" ${this.finished && 'true'}/>`);
    this.$el = $('<li class="list-group-item"></li>').html(`
    <div class="media-body">
    <p><label class="bug-finished">Finished </label></p>
    <strong>ID: ${this.id}</strong>
    <p>Cases: ${this.cases.map(item => `<span class="bug-case">${item}</span>`)}</p>
    <p>Description: ${this.desc}</p>
  </div>
    `);
    this.$el.find('.bug-finished').append($finished);
  }

  toggleFinish(finished) {
    this.finished = finished;
  }

  getBaseInfo() {
    return {
      id: this.id,
      desc: this.desc,
      cases: this.cases,
      tags: this.tags,
      finished: this.finished
    };
  }

  addCase(caseId) {
    if (this.cases.indexOf(caseId) === -1) {
      this.cases.push(caseId);
      this.updateStatus();
    }
  }
}

class Case {
  constructor(status) {
    this.state = status.state;
    this.title = status.title;
    this.id = status.id;
    this.$el = $('<tr></tr>').html(
      `<td>${this.id}</td><td>${this.title}</td><td>${this.state}</td>`
    );
  }

  getBaseInfo() {
    return {
      id: this.id,
      state: this.state,
      title: this.title,
      bugs: this.bugs
    };
  }

  bindClickEvent() {
    this.$el.on('contextmenu', (e) => {
      currentCase = this.id;
      menu.popup(remote.getCurrentWindow());
    });
  }
}

class Spec {
  constructor(status, switchFn) {
    const cases = status.cases || [];
    const bugs = status.bugs || [];
    this.passed = status.passed || 0;
    this.failed = status.failed || 0;
    this.id = status.id;
    this.name = status.name;
    this.desc = status.desc || '';
    this.bugs = bugs.map(item => new Bug(item));
    this.cases = cases.map(item => new Case(item));
    this.$el = $('<li class="list-group-item"></li>');
    this.updatePassedStatus();
    this.switchFn = switchFn;
  }

  bindClickEvent() {
    this.$el.click(() => {
      this.switchFn(this);
    });
  }

  createBug(desc) {
    this.bugs.push(new Bug({ desc, id: this.bugs.length + 1 }));
  }

  updatePassedStatus() {
    const $pass = this.failed === 0
      ? '<span class="icon icon-check"></span>'
      : '<span class="icon icon-cancel-circled"></span>';
    this.$el.html(`<div class="media-body">
    <strong>${this.name} ${$pass}</strong>
    <p>${this.desc}</p>
  </div>`);
  }

  active() {
    this.$el.addClass('active');
  }

  getBaseInfo() {
    return {
      passed: this.passed,
      name: this.name,
      desc: this.desc,
      id: this.id,
      failed: this.failed,
      cases: this.cases.map(item => item.getBaseInfo()),
      bugs: this.bugs.map(item => item.getBaseInfo())
    };
  }

  deactivate() {
    this.$el.removeClass('active');
  }
}

class Project {
  constructor(status, switchProjectFn, switchSpecFn) {
    this.status = status;
    this.name = status.name;
    this.specs = status.specs.map(s => new Spec(s, switchSpecFn));
    this.$el = $('<span class="nav-group-item"></span>').html(`
      ${this.name}`);
    this.$el.click((e) => {
      switchProjectFn(this);
      this.active();
    });
    this.switchSpecFn = switchSpecFn;
  }

  getBaseInfo() {
    return {
      name: this.name,
      specs: this.specs.map(spec => spec.getBaseInfo())
    };
  }

  addSpec(name) {
    const id = this.specs.length + 1;
    this.specs.push(new Spec({ name, id }, this.switchSpecFn));
  }

  save() {
    return ipcRenderer.sendSync('save-project', this.getBaseInfo());
  }

  active() {
    this.$el.addClass('active');
  }

  deactivate() {
    this.$el.removeClass('active');
  }
}

$(document).ready(() => {
  // Electron Drop Trick
  document.addEventListener('dragover', event => event.preventDefault());
  document.addEventListener('drop', event => event.preventDefault());

  const chart = echarts.init(document.getElementById('chart'));
  const $projectBox = $('.project-box');
  const $specBox = $('.spec-box');
  const $specName = $('#spec-name');
  const $save = $('#save');
  const $specId = $('#spec-id');
  const $specDesc = $('#spec-desc');
  const $play = $('#run-task');
  const $createProject = $('#create-project');
  const $createSpec = $('#createSpec');
  const $cases = $('#cases');
  const $dragBox = $('#drag-box');
  const $bugBox = $('#bug-box');
  const $createBug = $('#create-bug');
  const editor = CodeMirror(document.getElementById('editor'), {
    value: '',
    lineNumbers: true,
    lineWrapping: true,
    mode: 'javascript'
  });
  let projects = [];
  let currentProject = null;
  let specs = getSpecs();
  let currentSpec = specs[0] || null;

  initialize();

  function freshProjects() {
    sync();
    currentProject = projects[0] || null;
    $projectBox.find('.nav-group-item').remove();
    projects.forEach((project) => {
      $projectBox.append(project.$el);
    });
    currentProject && switchProject(currentProject);
  }

  function runTask(projectName, specName) {
    submitCode();
    ipcRenderer.send('run-test', {
      projectName,
      specName
    });
  }

  function sync() {
    const rawProjects = ipcRenderer.sendSync('sync', 'init');
    projects = rawProjects.map(status => new Project(status, switchProject, switchSpec));
  }

  function freshSpecCode() {
    if (!currentProject || !currentSpec) return;
    const content = ipcRenderer.sendSync('read', {
      projectName: currentProject.name,
      specName: currentSpec.name
    });
    editor.setValue(content);
  }

  function freshCases() {
    $cases.empty();
    currentSpec.cases.forEach((c) => {
      $cases.append(c.$el);
      c.bindClickEvent();
    });
  }
  function freshStatus() {
    $specName.val(currentSpec.name);
    $specId.val(currentSpec.id);
    $specDesc.val(currentSpec.desc);
    currentSpec.updatePassedStatus();
    freshCases();
    freshSpecCode();
    freshBugs();
    freshChart();
  }

  function freshBugs() {
    $bugBox.empty();

    if (currentSpec.bugs.length === 0) {
      $bugBox.html('<p style="text-align: center;">No bugs</p>');
    }
    currentSpec.bugs.forEach((item) => {
      $bugBox.append(item.$el);
    });
  }
  function switchSpec(spec) {
    if (currentSpec) {
      currentSpec.deactivate();
    }
    currentSpec = spec;
    currentSpec.active();
    freshStatus();
  }

  function freshSpecs() {
    specs = getSpecs();
    $specBox.find('.list-group-item').remove();
    specs.forEach((spec) => {
      $specBox.append(spec.$el);
      spec.bindClickEvent();
    });
    currentSpec = specs[0] || null;
    currentSpec && switchSpec(currentSpec);
  }

  function getSpecs() {
    return currentProject ? currentProject.specs : [];
  }
  function submitCode() {
    if (!currentProject || !currentSpec) return false;
    const res = ipcRenderer.sendSync('save-code', {
      projectName: currentProject.name,
      specName: currentSpec.name,
      content: editor.getValue()
    });
    return res;
  }

  function save() {
    const res = currentProject.save() && submitCode();
    if (res) {
      freshSpecs();
    }
  }

  function freshChart(passed, failed) {
    passed = passed || currentSpec.passed;
    failed = failed || currentSpec.failed;
    chart.setOption({
      series: [
        {
          name: 'Test Result',
          type: 'pie',
          data: [{ value: passed, name: 'Passed' }, { value: failed, name: 'Not-pass' }]
        }
      ]
    });
  }
  function switchProject(project) {
    if (currentProject) {
      currentProject.deactivate();
    }
    currentProject = project;
    currentProject.active();
    freshSpecs();
  }
  function createProject() {
    return prompt({
      title: 'Lilliput',
      label: "What's your project name?",
      type: 'input'
    })
      .then((value) => {
        if (value) {
          return ipcRenderer.sendSync('create-project', {
            projectName: value
          });
        }
      })
      .catch(console.error);
  }

  function createBug() {
    return prompt({
      title: 'Lilliput',
      label: "What's the description of this bug?",
      type: 'input'
    })
      .then((value) => {
        if (value) {
          return value;
        }
      })
      .catch(console.error);
  }
  function createSpec() {
    return prompt({
      title: 'Lilliput',
      label: "What's the name of this Spec?",
      type: 'input'
    })
      .then((value) => {
        if (value) {
          return ipcRenderer.send('create-spec', {
            specName: value
          });
        }
      })
      .catch(console.error);
  }
  function addDataset(filePath) {
    ipcRenderer.send('add-dataset', {
      filePath,
      projectName: currentProject.name
    });
  }
  function initialize() {
    freshProjects();
    freshSpecs();

    $projectBox.click((e) => {});
    $play.click((e) => {
      runTask(currentProject.name, currentSpec.name);
    });
    $save.click((e) => {
      save();
    });
    $specName.change((e) => {
      currentSpec.name = e.target.value;
    });
    $specDesc.change((e) => {
      currentSpec.desc = e.target.value;
    });
    document.getElementById('drag-box').ondrop = (e) => {
      const filePath = e.dataTransfer.files[0].path;
      const extname = path.extname(filePath);
      if (extname && extname === '.csv') {
        $dragBox.find('#dataset-name').text(filePath);
        addDataset(filePath);
      } else {
        alert('Not support file types except CSV.');
      }
    };
    $createProject.click((e) => {
      createProject().then((res) => {
        if (res) {
          freshProjects();
          alert('Create project successfully');
        } else {
          alert('Create project failed');
        }
      });
    });
    $createBug.click((e) => {
      createBug().then((desc) => {
        if (desc) {
          currentSpec.createBug(desc);
          save();
          freshBugs();
        }
      });
    });
    $createSpec.click((e) => {
      createSpec().then((name) => {
        if (res) {
          currentProject.addCase();
        }
      });
    });
    currentSpec.bugs.forEach((item) => {
      menu.append(
        new MenuItem({
          label: `Add it to Bug.${item.id}`,
          click() {
            item.addCase(currentCase);
            save();
            freshBugs();
          }
        })
      );
    });
    ipcRenderer.on('run-test-resp', (event, arg) => {
      const { passed, failed, cases } = arg;
      currentSpec.passed = passed;
      currentSpec.failed = failed;
      currentSpec.cases = cases.map(c => new Case(c));
      currentProject.save();
      freshStatus();
    });
  }
});
