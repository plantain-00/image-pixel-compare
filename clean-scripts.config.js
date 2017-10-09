const childProcess = require('child_process')
const util = require('util')
const { Service } = require('clean-scripts')

const execAsync = util.promisify(childProcess.exec)

module.exports = {
  build: [
    {
      js: [
        'file2variable-cli *.template.html -o variables.ts --html-minify',
        'tsc',
        'webpack --display-modules'
      ],
      css: [
        'lessc index.less > index.css',
        `postcss index.css -o index.postcss.css`,
        'cleancss -o index.bundle.css index.postcss.css ./node_modules/github-fork-ribbon-css/gh-fork-ribbon.css ./node_modules/file-uploader-component/file-uploader.min.css'
      ],
      clean: 'rimraf **/*.bundle-*.js *.bundle-*.css'
    },
    'rev-static',
    [
      'sw-precache --config sw-precache.config.js --verbose',
      'uglifyjs service-worker.js -o service-worker.bundle.js'
    ]
  ],
  lint: {
    ts: `tslint "*.ts"`,
    js: `standard "**/*.config.js"`,
    less: `stylelint "index.less"`,
    export: `no-unused-export "*.ts" "index.less"`
  },
  test: [
    'tsc -p spec',
    'karma start spec/karma.config.js',
    async () => {
      const { stdout } = await execAsync('git status -s')
      if (stdout) {
        console.log(stdout)
        throw new Error(`generated files doesn't match.`)
      }
    }
  ],
  fix: {
    ts: `tslint "*.ts"`,
    js: `standard --fix "**/*.config.js"`,
    less: `stylelint --fix "index.less"`
  },
  watch: {
    template: `file2variable-cli *.template.html -o variables.ts --html-minify --watch`,
    tsc: `tsc --watch`,
    webpack: `webpack --watch`,
    less: `watch-then-execute "index.less" --script "clean-scripts build[0].css"`,
    rev: `rev-static --watch`,
    sw: `watch-then-execute "vendor.bundle-*.js" "index.html" --script "clean-scripts build[2]"`
  },
  screenshot: [
    new Service(`http-server -p 8000`),
    `tsc -p screenshots`,
    `node screenshots/index.js`
  ],
  prerender: [
    new Service(`http-server -p 8000`),
    `tsc -p prerender`,
    `node prerender/index.js`,
    'clean-scripts build[1]',
    'clean-scripts build[2]'
  ]
}
