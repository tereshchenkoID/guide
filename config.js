const entryPath = 'src'
const outputPath = 'build'

const config = {
  src: {
    root: entryPath,
    pug: `${entryPath}/pug`,
    scss: `${entryPath}/scss`,
    js: `${entryPath}/js`,
    assets: 'assets',
    fonts: `${entryPath}/assets/fonts`,
    img: `${entryPath}/assets/img`,
  },
  dest: {
    root: outputPath,
    css: 'css',
    js: 'js',
  },
}

module.exports = config
