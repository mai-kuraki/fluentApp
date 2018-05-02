const grunt = require("grunt");
grunt.config.init({
    pkg: grunt.file.readJSON('package.json'),
    'create-windows-installer': {
        x64: {
            appDirectory: './zhihu-win32-x64',
            authors: 'maikuraki.',
            exe: 'fluentApp.exe',
            description:"music app",
        }
    }
});

grunt.loadNpmTasks('grunt-electron-installer');
grunt.registerTask('default', ['create-windows-installer']);
