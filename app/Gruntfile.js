const grunt = require("grunt");
grunt.config.init({
    pkg: grunt.file.readJSON('package.json'),
    'create-windows-installer': {
        x64: {
            appDirectory: './fluentApp-win32-x64',
            authors: 'maikuraki.',
            exe: 'fluentApp.exe',
            description:"music app",
        }
    }
});

grunt.loadNpmTasks('grunt-electron-installer');
grunt.registerTask('default', ['create-windows-installer']);
/**
 * 样例文件,Gruntfile.js作用于fluentApp-win32-x64(构建后文件夹)
 */
