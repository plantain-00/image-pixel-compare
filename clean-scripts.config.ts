import { executeScriptAsync } from 'clean-scripts'
import { watch } from 'watch-then-execute'

const tsFiles = `"*.ts"`
const lessFiles = `"*.less"`

const isDev = process.env.NODE_ENV === 'development'

const templateCommand = 'file2variable-cli --config file2variable.config.ts'
const webpackCommand = 'webpack --config webpack.config.ts'
const revStaticCommand = 'rev-static --config rev-static.config.ts'
const cssCommand = [
  'lessc index.less > index.css',
  `postcss index.css -o index.postcss.css`,
  'cleancss -o index.bundle.css index.postcss.css ./node_modules/github-fork-ribbon-css/gh-fork-ribbon.css ./node_modules/file-uploader-component/dist/file-uploader.min.css'
]
const swCommand = isDev ? undefined : [
  'sw-precache --config sw-precache.config.js --verbose',
  'uglifyjs service-worker.js -o service-worker.bundle.js'
]

export default {
  build: [
    {
      js: [
        templateCommand,
        webpackCommand
      ],
      css: cssCommand,
      clean: 'rimraf **/*.bundle-*.js *.bundle-*.css'
    },
    revStaticCommand,
    swCommand
  ],
  lint: {
    ts: `eslint --ext .js,.ts,.tsx ${tsFiles}`,
    less: `stylelint ${lessFiles}`,
    export: `no-unused-export ${tsFiles} ${lessFiles}`,
    markdown: `markdownlint README.md`,
    typeCoverage: 'type-coverage -p . --strict --ignore-files variables.ts'
  },
  test: [
  ],
  fix: {
    ts: `eslint --ext .js,.ts,.tsx ${tsFiles} --fix`,
    less: `stylelint --fix ${lessFiles}`
  },
  watch: {
    template: `${templateCommand} --watch`,
    webpack: `${webpackCommand} --watch`,
    less: () => watch(['*.less'], [], () => executeScriptAsync(cssCommand)),
    rev: `${revStaticCommand} --watch`
  }
}
